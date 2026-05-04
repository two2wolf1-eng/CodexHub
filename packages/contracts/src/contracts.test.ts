import { describe, expect, it } from 'vitest';
import {
  CodexExecLiveRunRecordSchema,
  CodexExecLiveConfigSchema,
  CodexExecConfigLoadResultSchema,
  CodexExecApprovalTransitionResultSchema,
  CodexExecControlPlaneTimelineSchema,
  CodexExecTimelineDetailViewSchema,
  CodexExecAuditDetailViewSchema,
  CodexExecAuditSearchResultSchema,
  CodexExecControlPlaneDrilldownViewSchema,
  CodexExecEvidenceDetailViewSchema,
  CodexExecEvidenceSearchResultSchema,
  CodexExecControlPlaneReportExportResultSchema,
  CodexExecControlPlaneReportSchema,
  CodexExecAdrReadinessChecklistItemSchema,
  CodexExecGovernanceBlockerSchema,
  CodexExecGovernanceReviewPackageQuerySchema,
  CodexExecGovernanceReviewPackageSchema,
  CodexExecGovernanceReviewPackageSummarySchema,
  CodexExecLiveAdapterAdrDraftExportResultSchema,
  CodexExecLiveAdapterAdrDraftQuerySchema,
  CodexExecLiveAdapterAdrDraftSchema,
  CodexExecLiveAdapterAdrDraftSectionSchema,
  CodexExecLiveAdapterAdrDraftSummarySchema,
  CodexExecLiveAdapterAdrDecisionGatePolicySchema,
  CodexExecLiveAdapterAdrDecisionQuerySchema,
  CodexExecLiveAdapterAdrDecisionRecordSchema,
  CodexExecLiveAdapterAdrDecisionSummarySchema,
  CodexExecReadOnlyAdapterOperatorChecklistItemSchema,
  CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema,
  CodexExecReadOnlyAdapterPreflightSimulationCheckSchema,
  CodexExecReadOnlyAdapterPreflightSimulationInputSchema,
  CodexExecReadOnlyAdapterPreflightSimulationResultSchema,
  CodexExecReadOnlyAdapterPreflightSimulationSummarySchema,
  CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterSimulatorReviewFindingSchema,
  CodexExecReadOnlyAdapterSimulatorReviewQuerySchema,
  CodexExecReadOnlyAdapterSimulatorReviewSummarySchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema,
  CodexExecReadOnlyAdapterSkeletonConfigSchema,
  CodexExecReadOnlyAdapterSkeletonPreviewSchema,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterSkeletonReviewSummarySchema,
  CodexExecReadOnlyAdapterFixtureBoundaryResultSchema,
  CodexExecReadOnlyAdapterFixtureBoundarySummarySchema,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema,
  CodexExecReadOnlyAdapterFinalReadinessSummarySchema,
  CodexExecRealReadOnlyAdapterReadinessBlockerSchema,
  CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema,
  CodexExecRealReadOnlyAdapterReadinessFindingSchema,
  CodexExecRealReadOnlyAdapterReadinessGateSchema,
  CodexExecRealReadOnlyAdapterReadinessPackageSchema,
  CodexExecRealReadOnlyAdapterReadinessQuerySchema,
  CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema,
  CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema,
  CodexExecRealReadOnlyAdapterReadinessSummarySchema,
  CodexExecRealReadOnlyAdapterAuditSummarySchema,
  CodexExecRealReadOnlyAdapterApprovalAuthoritySummarySchema,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuerySchema,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecordSchema,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummarySchema,
  CodexExecRealReadOnlyAdapterAttemptQuerySchema,
  CodexExecRealReadOnlyAdapterAttemptRecordSchema,
  CodexExecRealReadOnlyAdapterAttemptSummarySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema,
  CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema,
  CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema,
  CodexExecRealReadOnlyAdapterBoundaryPlanSchema,
  CodexExecRealReadOnlyAdapterConfigSchema,
  CodexExecRealReadOnlyAdapterErrorSchema,
  CodexExecRealReadOnlyAdapterEvidenceSummarySchema,
  CodexExecRealReadOnlyAdapterPolicySourceBlockerSchema,
  CodexExecRealReadOnlyAdapterPolicySourceChecklistItemSchema,
  CodexExecRealReadOnlyAdapterPolicySourceFindingSchema,
  CodexExecRealReadOnlyAdapterPolicySourceGateSchema,
  CodexExecRealReadOnlyAdapterPolicySourceQuerySchema,
  CodexExecRealReadOnlyAdapterPolicySourceRecordSchema,
  CodexExecRealReadOnlyAdapterPolicySourceSummarySchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema,
  CodexExecRealReadOnlyAdapterPreflightCheckSchema,
  CodexExecRealReadOnlyAdapterPreflightSchema,
  CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema,
  CodexExecRealReadOnlyAdapterRequestSchema,
  CodexExecRealReadOnlyAdapterResultSchema,
  CodexExecNoLiveEvidenceSummarySchema,
  CodexExecReportReviewComparisonSchema,
  CodexExecReportReviewComparisonItemSchema,
  CodexExecReportReviewHistoryViewSchema,
  CodexExecReportReviewRecordSchema,
  CodexExecReportReviewSummarySchema,
  CodexExecReviewerHandoffSummarySchema,
  CodexExecTimelineFilterSchema,
  CodexExecTimelineQuerySchema,
  CodexExecManualApprovalRecordSchema,
  CodexExecManualApprovalStateSchema,
  CodexExecPreflightResultSchema,
  DevelopmentRequestSchema,
  CodexReplayRecordSchema,
  CodexExecReplayResultSchema,
  ActionModeSchema,
  CapabilityAuditEventSchema,
  CapabilityDryRunSchema,
  CapabilityExecutionResultSchema,
  CapabilityManifestSchema,
  ExecutionAuthoritySchema,
  EvidenceRefSchema,
  McpToolDefinitionSchema,
  McpToolInvocationSummarySchema,
  McpToolNameSchema,
  AffectedProjectSchema,
  BrowserForbiddenActionSchema,
  BrowserObservationApprovalArtifactRecordSchema,
  BrowserObservationCapabilitySchema,
  BrowserObservationControlPlaneApprovalStatusSchema,
  BrowserObservationControlPlaneRunSchema,
  BrowserObservationDryRunRecordSchema,
  BrowserObservationRunnerModeSchema,
  BrowserObservationRunSchema,
  BrowserObservationRunStatusSchema,
  BrowserObservationTimelineEventSchema,
  BrowserPageObservationPlanSchema,
  BrowserPageObservationSummarySchema,
  BrowserProfileReadinessSchema,
  BrowserProfileRefSchema,
  ElectronCdpAllowedCommandSchema,
  ElectronCdpBlockReasonSchema,
  ElectronCdpCommandAllowlistDecisionSchema,
  ElectronCdpConsoleSummarySchema,
  ElectronCdpEventMetadataSummarySchema,
  ElectronCdpForbiddenActionSchema,
  ElectronCdpNetworkMetadataSummarySchema,
  ElectronCdpControlPlaneApprovalStatusSchema,
  ElectronCdpObservationApprovalArtifactRecordSchema,
  ElectronCdpObservationCapabilitySchema,
  ElectronCdpObservationControlPlaneRunSchema,
  ElectronCdpObservationDryRunRecordSchema,
  ElectronCdpObservationPlanSchema,
  ElectronCdpObservationRunnerModeSchema,
  ElectronCdpObservationRunSchema,
  ElectronCdpObservationRunStatusSchema,
  ElectronCdpObservationSummarySchema,
  ElectronCdpObservationTimelineEventSchema,
  ElectronDebugEndpointSummarySchema,
  ElectronProcessKindSchema,
  ElectronProcessSummarySchema,
  ElectronTargetSummarySchema,
  ElectronTargetTypeSchema,
  OrchestrationRunSchema,
  OrchestrationRunStatusSchema,
  OrchestrationTimelineEventSchema,
  ControlledPatchLifecycleRunSchema,
  ControlledPatchPlanSchema,
  ControlledPatchReadinessSchema,
  ControlledPatchRejectionReasonSchema,
  ControlledPatchRunSchema,
  ControlledPatchVerificationGateSchema,
  DiffReviewSummarySchema,
  GovernedCodexPatchPlanSchema,
  GovernedCodexPatchRunSchema,
  PatchRunSchema,
  PatchSummarySchema,
  PolicyBackendEvaluationPlanSchema,
  PolicyBackendEvaluationRunSchema,
  PolicyBackendEvaluatorSourceSchema,
  PolicyBackendKindSchema,
  PolicyBackendNormalizedDecisionTraceSchema,
  PolicyBackendRawEvaluationSummarySchema,
  PolicyDecisionSchema,
  PullRequestSummaryDraftSchema,
  ReleaseAuditDraftSchema,
  SchemaVersionSchema,
  SkillResolutionResultSchema,
  TelemetryExportRunSchema,
  TelemetryExporterKindSchema,
  TelemetrySignalKindSchema,
  TelemetrySpanSummarySchema,
  TelemetryTraceExportPlanSchema,
  AuditChainProjectionSchema,
  ConfigHashSummarySchema,
  EvidenceBundleProjectionSchema,
  GoldenPathEvidenceBundleSchema,
  GoldenPathRehearsalRunSchema,
  GoldenPathStepSchema,
  GoldenPathStepStatusSchema,
  ApprovalDecisionHistoryItemSchema,
  ApprovalDecisionHistoryProjectionSchema,
  ApprovalDecisionHistorySummarySchema,
  ApprovalDecisionRequestSchema,
  ApprovalDecisionResultSchema,
  ApprovalInboxItemSchema,
  ApprovalInboxProjectionSchema,
  ApprovalUxDecisionSchema,
  ApprovalUxTypeSchema,
  M9PilotEvidenceSummarySchema,
  M11PilotEvidenceSummarySchema,
  M11PilotCleanupApprovalStatusSchema,
  M11PilotCleanupHandoffSchema,
  M11PilotFailureSummarySchema,
  M11PilotReadinessSchema,
  M11PilotRecoveryActionSchema,
  M11PilotRecoveryProjectionSchema,
  M11PilotRunSchema,
  M11PilotStepSchema,
  M11PilotAcceptanceScenarioSchema,
  M11PilotAcceptanceSmokeRunSchema,
  M11PilotAcceptanceSmokeStepSchema,
  M10PilotChecklistSchema,
  M10PilotChecklistStatusSchema,
  M10PilotAcceptanceEvidenceSummarySchema,
  M10PilotAcceptanceRehearsalRunSchema,
  M10PilotAcceptanceScenarioSchema,
  M10PilotAcceptanceStepSchema,
  M10PilotOperatorStepPhaseSchema,
  M10PilotOperatorStepSchema,
  M10PilotOperatorStepStatusSchema,
  M10PilotRunbookSummarySchema,
  M11PilotEnablementChecklistSchema,
  M11PilotEnablementRunbookSummarySchema,
  M11PilotEnablementStatusSchema,
  M11PilotEnablementStepPhaseSchema,
  M11PilotEnablementStepSchema,
  M11PilotEnablementStepStatusSchema,
  M9PilotReadinessSchema,
  M9PilotRunSchema,
  M9PilotStepSchema,
  GovernanceProjectionSummarySchema,
  IntegrationReadinessSummarySchema,
  OperatorReadinessCheckSchema,
  OperatorReadinessReportSchema,
  OperatorReadinessStatusSchema,
  UnifiedRunProjectionSchema,
  UnifiedRunSourceSchema,
  UnifiedTimelineEventSchema,
  VerificationCommandResultSchema,
  VerificationPlanSchema,
  VerificationRunSchema,
  VerificationTargetSchema,
  WorktreeApprovalArtifactRecordSchema,
  WorktreeCleanupApprovalArtifactRecordSchema,
  WorktreeCleanupControlPlaneRunSchema,
  WorktreeCleanupDryRunRecordSchema,
  WorktreeCleanupPlanSchema,
  WorktreeCleanupRunSchema,
  WorktreeControlPlaneRunSchema,
  WorktreeDryRunRecordSchema,
  WorktreePlanSchema,
  WorktreeRunSchema,
  WorkflowRunSchema,
} from './index';

const createdAt = '2026-04-28T00:00:00.000Z';
const schemaVersion = SchemaVersionSchema.value;

describe('contracts schemas', () => {
  it('parses core created models', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_1',
      schemaVersion,
      createdAt,
      kind: 'dry-run',
      hash: 'sha256:abc',
      metadata: { source: 'test' },
    });

    const decision = PolicyDecisionSchema.parse({
      id: 'policy_1',
      schemaVersion,
      createdAt,
      actionId: 'action_1',
      actionType: 'filesystem.read',
      actionMode: 'read',
      riskLevel: 'low',
      outcome: 'allow',
      requiresDryRun: false,
      requiresApproval: false,
    });

    const run = WorkflowRunSchema.parse({
      id: 'run_1',
      schemaVersion,
      createdAt,
      workflowName: 'development.bootstrap',
      status: 'created',
      dryRun: true,
      evidenceRefs: [evidence],
    });

    const request = DevelopmentRequestSchema.parse({
      id: 'devreq_1',
      schemaVersion,
      createdAt,
      title: 'Bootstrap',
      description: 'Create a foundation-only scaffold.',
    });

    expect(decision.outcome).toBe('allow');
    expect(run.workflowName).toBe('development.bootstrap');
    expect(request.constraints).toEqual([]);
  });

  it('parses integration-first capability contracts', () => {
    expect(ActionModeSchema.options).toEqual(['read', 'dry-run', 'write', 'admin']);
    expect(() => ActionModeSchema.parse('execute')).toThrow();

    const manifests = [
      {
        id: 'capability_codex_cli',
        schemaVersion,
        createdAt,
        name: 'codex-cli',
        kind: 'codex',
        version: 'foundation',
        provider: 'external-process',
        capabilities: ['codex.exec.jsonl'],
        defaultRisk: 'medium',
        defaultActionMode: 'dry-run',
        requiresApprovalByDefault: true,
        evidencePolicy: {
          collect: true,
          redactMetadata: true,
          bodyStorage: 'hash-only',
        },
        processBoundary: {
          mayStartExternalProcess: true,
          requiresProcessAudit: true,
        },
      },
      {
        id: 'capability_nx_affected',
        schemaVersion,
        createdAt,
        name: 'nx-affected',
        kind: 'verification',
        version: 'foundation',
        provider: 'open-source',
        capabilities: ['nx.affected.lint', 'nx.affected.test', 'nx.affected.build'],
        defaultRisk: 'low',
        defaultActionMode: 'read',
        requiresApprovalByDefault: false,
        evidencePolicy: {
          collect: true,
          redactMetadata: true,
          bodyStorage: 'hash-only',
        },
        processBoundary: {
          mayStartExternalProcess: true,
          requiresProcessAudit: true,
        },
      },
      {
        id: 'capability_mcp_server',
        schemaVersion,
        createdAt,
        name: 'codexhub-mcp-server',
        kind: 'mcp',
        version: 'foundation',
        provider: 'official-sdk',
        capabilities: ['codexhub.getPolicySummary'],
        defaultRisk: 'low',
        defaultActionMode: 'read',
        requiresApprovalByDefault: false,
        evidencePolicy: {
          collect: true,
          redactMetadata: true,
          bodyStorage: 'forbidden',
        },
        processBoundary: {
          mayStartExternalProcess: false,
          requiresProcessAudit: false,
        },
      },
      {
        id: 'capability_browser_observer',
        schemaVersion,
        createdAt,
        name: 'playwright-observer',
        kind: 'browser',
        version: 'foundation',
        provider: 'open-source',
        capabilities: ['browser.observe.title', 'browser.observe.aria'],
        defaultRisk: 'medium',
        defaultActionMode: 'read',
        requiresApprovalByDefault: false,
        evidencePolicy: {
          collect: true,
          redactMetadata: true,
          bodyStorage: 'forbidden',
        },
        processBoundary: {
          mayStartExternalProcess: true,
          requiresProcessAudit: true,
        },
      },
      {
        id: 'capability_electron_cdp',
        schemaVersion,
        createdAt,
        name: 'electron-cdp',
        kind: 'electron',
        version: 'foundation',
        provider: 'open-source',
        capabilities: ['electron.target.summary'],
        defaultRisk: 'medium',
        defaultActionMode: 'read',
        requiresApprovalByDefault: false,
        evidencePolicy: {
          collect: true,
          redactMetadata: true,
          bodyStorage: 'forbidden',
        },
        processBoundary: {
          mayStartExternalProcess: false,
          requiresProcessAudit: true,
        },
      },
    ];

    for (const manifest of manifests) {
      expect(CapabilityManifestSchema.parse(manifest).name).toBe(manifest.name);
    }

    const dryRun = CapabilityDryRunSchema.parse({
      id: 'capability_dry_run_1',
      schemaVersion,
      createdAt,
      adapterName: 'codex-cli',
      inputSummary: {
        inputHash: 'sha256:prompt',
      },
      plannedActions: [
        {
          action: 'codex.exec.jsonl',
          actionMode: 'dry-run',
          risk: 'medium',
          target: 'workspace',
          requiresApproval: false,
        },
      ],
      requiredEvidence: ['dry-run-plan'],
      warnings: ['process boundary is planned only'],
    });

    const authority = ExecutionAuthoritySchema.parse({
      id: 'execution_authority_1',
      schemaVersion,
      createdAt,
      policyDecisionId: 'policy_1',
      approvalArtifactId: 'approval_1',
      allowed: true,
      constraints: ['read-only sandbox'],
      expiresAt: '2026-05-28T00:00:00.000Z',
    });

    const results = ['blocked', 'completed', 'failed', 'aborted'].map((status) =>
      CapabilityExecutionResultSchema.parse({
        id: `capability_result_${status}`,
        schemaVersion,
        createdAt,
        status,
        processBoundaryInvoked: status !== 'blocked',
        externalProcessStarted: status !== 'blocked',
        noRealWrite: true,
        evidenceRefs: ['evidence_1'],
        auditEventIds: ['audit_1'],
        summary: `${status} result`,
      }),
    );

    expect(dryRun.plannedActions[0]?.actionMode).toBe('dry-run');
    expect(authority.policyDecisionId).toBe('policy_1');
    expect(results.map((result) => result.status)).toEqual([
      'blocked',
      'completed',
      'failed',
      'aborted',
    ]);
    expect(results[0]?.externalProcessStarted).toBe(false);
    expect(results[1]?.processBoundaryInvoked).toBe(true);
  });

  it('parses read-only MCP tool contracts and evidence kinds', () => {
    expect(McpToolNameSchema.options).toEqual([
      'codexhub.getArchitectureMap',
      'codexhub.getPolicySummary',
      'codexhub.getRiskMatrix',
      'codexhub.getEvidenceSummary',
      'codexhub.getOpenDevelopmentRequests',
      'codexhub.getAffectedProjectsDryRun',
      'codexhub.readObservationSnapshot',
    ]);

    const definition = McpToolDefinitionSchema.parse({
      id: 'mcp_tool_get_architecture',
      schemaVersion,
      createdAt,
      name: 'codexhub.getArchitectureMap',
      title: 'Get architecture map',
      description: 'Return read-only project architecture metadata.',
      enabled: true,
      riskLevel: 'low',
      actionMode: 'read',
      approvalPolicy: 'not-required',
      evidencePolicy: {
        collect: true,
        redactMetadata: true,
        bodyStorage: 'hash-only',
      },
    });
    const invocation = McpToolInvocationSummarySchema.parse({
      id: 'mcp_invocation_1',
      schemaVersion,
      createdAt,
      toolName: definition.name,
      status: 'completed',
      policyDecisionId: 'policy_mcp',
      evidenceRefIds: ['evidence_mcp'],
      auditEventIds: ['audit_mcp'],
      inputHash: 'sha256:input',
      outputHash: 'sha256:output',
      summary: 'Read-only MCP tool completed.',
    });
    const manifestEvidence = EvidenceRefSchema.parse({
      id: 'evidence_mcp_manifest',
      schemaVersion,
      createdAt,
      kind: 'mcp.tool_manifest',
      hash: 'sha256:manifest',
    });
    const invocationEvidence = EvidenceRefSchema.parse({
      id: 'evidence_mcp_invocation',
      schemaVersion,
      createdAt,
      kind: 'mcp.tool_invocation_summary',
      hash: 'sha256:invocation',
    });

    expect(definition.actionMode).toBe('read');
    expect(invocation.bodyStored).toBe(false);
    expect(invocation.rawPathStored).toBe(false);
    expect(manifestEvidence.kind).toBe('mcp.tool_manifest');
    expect(invocationEvidence.kind).toBe('mcp.tool_invocation_summary');
    expect(() =>
      EvidenceRefSchema.parse({
        id: 'evidence_bad',
        schemaVersion,
        createdAt,
        kind: 'mcp.tool_raw_body',
        hash: 'sha256:bad',
      }),
    ).toThrow();
  });

  it('parses browser read-only observation contracts without raw bodies or paths', () => {
    expect(BrowserObservationCapabilitySchema.options).toEqual([
      'title',
      'url',
      'accessibility_snapshot',
      'console_summary',
      'network_metadata_summary',
    ]);
    expect(BrowserObservationRunnerModeSchema.options).toEqual([
      'fixture',
      'controlled-local-browser',
    ]);
    expect(BrowserForbiddenActionSchema.options).toContain('cookie_extraction');
    expect(BrowserObservationRunStatusSchema.options).toEqual([
      'planned',
      'completed',
      'failed',
      'blocked',
      'aborted',
    ]);

    const profileRef = BrowserProfileRefSchema.parse({
      id: 'browser_profile_ref_1',
      schemaVersion,
      createdAt,
      profileId: 'default',
      displayName: 'Default profile',
      profilePathHash: 'sha256:profile-path',
      rawPathStored: false,
      readOnly: true,
    });
    const readiness = BrowserProfileReadinessSchema.parse({
      id: 'browser_profile_readiness_1',
      schemaVersion,
      observedAt: createdAt,
      profileRef,
      status: 'blocked',
      blockReasons: ['profile_probe_disabled'],
      allowedCapabilities: ['title', 'url'],
      forbiddenActions: ['click', 'type', 'cookie_extraction'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Profile readiness is metadata-only and probe-disabled.',
    });
    const plan = BrowserPageObservationPlanSchema.parse({
      id: 'browser_observation_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'playwright-observer',
      profileRef,
      runnerMode: 'fixture',
      requestedCapabilities: ['title', 'accessibility_snapshot', 'console_summary'],
      forbiddenActions: ['screenshot', 'network_body', 'click'],
      blockReasons: [],
      screenshotPlanned: false,
      networkBodyStorage: 'forbidden',
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Plan browser read-only observation with fixture runner only.',
    });
    const controlledPlan = BrowserPageObservationPlanSchema.parse({
      ...plan,
      id: 'browser_observation_plan_controlled_1',
      runnerMode: 'controlled-local-browser',
      targetUrlHash: 'sha256:target-url',
      processBoundaryPlanned: true,
      summary: 'Plan browser read-only observation with controlled local browser runner.',
    });
    const pageSummary = BrowserPageObservationSummarySchema.parse({
      id: 'browser_page_summary_1',
      schemaVersion,
      observedAt: createdAt,
      source: 'playwright-observer.fixture',
      kind: 'browser.page.summary',
      summary: 'Fixture page observation completed.',
      severity: 'info',
      planId: plan.id,
      profileRef,
      titleObserved: true,
      pageTitleHash: 'sha256:title',
      urlObserved: true,
      pageUrlHash: 'sha256:url',
      accessibilitySnapshotHash: 'sha256:aria',
      accessibilityNodeCount: 3,
      consoleSummary: {
        messageCount: 2,
        warningCount: 1,
        errorCount: 0,
        bodyStored: false,
      },
      networkSummary: {
        requestCount: 4,
        responseCount: 4,
        failedRequestCount: 0,
        bodyStored: false,
      },
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const controlledPageSummary = BrowserPageObservationSummarySchema.parse({
      ...pageSummary,
      id: 'browser_page_summary_controlled_1',
      source: 'playwright-observer.controlled-local-browser',
      planId: controlledPlan.id,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
    });
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_browser_summary',
      schemaVersion,
      createdAt,
      kind: 'browser.observation_summary',
      hash: 'sha256:browser-summary',
    });
    const run = BrowserObservationRunSchema.parse({
      id: 'browser_observation_run_1',
      schemaVersion,
      createdAt,
      status: 'completed',
      plan,
      readiness,
      pageSummary,
      evidenceRefs: [evidence],
      auditEventIds: ['audit_browser_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Browser observation fixture run completed.',
    });
    const policyDecision = PolicyDecisionSchema.parse({
      id: 'policy_browser_1',
      schemaVersion,
      createdAt,
      actionId: controlledPlan.id,
      actionType: 'browser.observe.read_only',
      actionMode: 'read',
      riskLevel: 'high',
      outcome: 'approval_required',
      requiresDryRun: false,
      requiresApproval: true,
    });
    const capabilityDryRun = CapabilityDryRunSchema.parse({
      id: 'capability_dry_run_browser_1',
      schemaVersion,
      createdAt,
      adapterName: 'playwright-observer',
      inputSummary: {
        targetUrlHash: controlledPlan.targetUrlHash,
        rawPathStored: false,
        bodyStored: false,
      },
      plannedActions: [
        {
          action: 'browser.observe.read_only',
          actionMode: 'read',
          risk: 'high',
          target: profileRef.profilePathHash,
          requiresApproval: true,
        },
      ],
    });
    const timelineEvent = BrowserObservationTimelineEventSchema.parse({
      id: 'browser_timeline_1',
      schemaVersion,
      createdAt,
      phase: 'dry-run',
      status: 'planned',
      summary: 'Browser observation dry-run persisted.',
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_browser_1'],
      bodyStored: false,
      rawPathStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const dryRunRecord = BrowserObservationDryRunRecordSchema.parse({
      id: 'browser_dry_run_record_1',
      schemaVersion,
      createdAt,
      dryRunId: 'browser_dry_run_1',
      status: 'ready',
      plan: controlledPlan,
      capabilityDryRun,
      policyDecision,
      targetUrlHash: controlledPlan.targetUrlHash,
      blockReasons: [],
      timeline: [timelineEvent],
      evidenceRefs: [evidence],
      auditEventIds: ['audit_browser_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Browser observation control-plane dry-run persisted.',
    });
    const approvalRecord = BrowserObservationApprovalArtifactRecordSchema.parse({
      id: 'browser_approval_record_1',
      schemaVersion,
      createdAt,
      dryRunId: dryRunRecord.dryRunId,
      dryRunRecordId: dryRunRecord.id,
      approvalRequestId: 'browser_approval_request_1',
      approvalArtifactId: 'browser_approval_artifact_1',
      status: 'approved',
      requestedBy: 'local-operator',
      decidedBy: 'local-operator',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: policyDecision.id,
      policyDecisionHash: 'sha256:policy',
      approved: true,
      requestedAt: createdAt,
      decidedAt: createdAt,
      expiresAt: '2026-04-28T01:00:00.000Z',
      evidenceRefs: [evidence],
      auditEventIds: ['audit_browser_approval_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Browser observation approval stores hashes and ids only.',
    });
    const controlRun = BrowserObservationControlPlaneRunSchema.parse({
      id: 'browser_control_run_1',
      schemaVersion,
      createdAt,
      dryRunId: dryRunRecord.dryRunId,
      dryRunRecordId: dryRunRecord.id,
      approvalArtifactId: approvalRecord.approvalArtifactId,
      status: 'completed',
      planId: controlledPlan.id,
      targetUrlHash: controlledPlan.targetUrlHash,
      browserRun: {
        ...run,
        id: 'browser_observation_run_controlled_1',
        plan: controlledPlan,
        pageSummary: controlledPageSummary,
        processBoundaryInvoked: true,
        externalProcessStarted: true,
      },
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_browser_run_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'Browser observation control-plane run completed.',
    });

    expect(run.status).toBe('completed');
    expect(BrowserObservationControlPlaneApprovalStatusSchema.options).toContain('used');
    expect(dryRunRecord.targetUrlHash).toBe('sha256:target-url');
    expect(approvalRecord.approved).toBe(true);
    expect(controlRun.processBoundaryInvoked).toBe(true);
    expect(run.pageSummary?.pageUrlHash).toBe('sha256:url');
    expect(controlledPlan.processBoundaryPlanned).toBe(true);
    expect(controlledPageSummary.externalProcessStarted).toBe(true);
    expect(run.rawPathStored).toBe(false);
    expect(JSON.stringify({ dryRunRecord, approvalRecord, controlRun })).not.toContain(
      'http://localhost',
    );
    expect(JSON.stringify({ dryRunRecord, approvalRecord, controlRun })).not.toContain(
      'session=secret',
    );
    expect(() =>
      BrowserProfileRefSchema.parse({
        ...profileRef,
        profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
      }),
    ).toThrow();
    expect(() =>
      BrowserPageObservationSummarySchema.parse({
        ...pageSummary,
        rawUrl: 'https://example.test/?token=secret',
      }),
    ).toThrow();
    expect(() =>
      BrowserPageObservationSummarySchema.parse({
        ...pageSummary,
        cookies: ['session=secret'],
      }),
    ).toThrow();
  });

  it('parses electron cdp read-only contracts without raw paths or live actions', () => {
    expect(ElectronProcessKindSchema.options).toContain('renderer');
    expect(ElectronTargetTypeSchema.options).toContain('webview');
    expect(ElectronCdpObservationCapabilitySchema.options).toEqual([
      'process_summary',
      'debug_endpoint_summary',
      'target_summary',
      'console_summary',
      'network_metadata_summary',
    ]);
    expect(ElectronCdpForbiddenActionSchema.options).toContain('runtime_evaluate');
    expect(ElectronCdpBlockReasonSchema.options).toContain(
      'non_loopback_endpoint_forbidden',
    );
    expect(ElectronCdpAllowedCommandSchema.options).toEqual([
      'Browser.getVersion',
      'Target.getTargets',
      'Log.enable',
      'Runtime.enable',
      'Network.enable',
    ]);
    expect(ElectronCdpObservationRunStatusSchema.options).toEqual([
      'planned',
      'completed',
      'failed',
      'blocked',
      'aborted',
    ]);

    const processSummary = ElectronProcessSummarySchema.parse({
      id: 'electron_process_summary_1',
      schemaVersion,
      createdAt,
      processIdHash: 'sha256:pid',
      executablePathHash: 'sha256:exe-path',
      commandLineHash: 'sha256:argv',
      processKind: 'renderer',
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Electron process metadata stores hashes only.',
    });
    const endpoint = ElectronDebugEndpointSummarySchema.parse({
      id: 'electron_endpoint_summary_1',
      schemaVersion,
      createdAt,
      endpointIdHash: 'sha256:endpoint',
      hostHash: 'sha256:loopback-host',
      portHash: 'sha256:9222',
      protocol: 'cdp',
      loopbackOnly: true,
      userEnabled: true,
      mainInspectorEnabled: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Loopback Electron debug endpoint summary.',
    });
    const target = ElectronTargetSummarySchema.parse({
      id: 'electron_target_summary_1',
      schemaVersion,
      observedAt: createdAt,
      endpointIdHash: endpoint.endpointIdHash,
      targetIdHash: 'sha256:target',
      targetType: 'webview',
      titleHash: 'sha256:title',
      urlHash: 'sha256:url',
      attached: false,
      mainInspector: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Renderer target summary is metadata-only.',
    });
    const commandDecision = ElectronCdpCommandAllowlistDecisionSchema.parse({
      id: 'electron_command_decision_1',
      schemaVersion,
      createdAt,
      command: 'Target.getTargets',
      allowed: true,
      riskLevel: 'low',
      reason: 'Read-only target listing is allowlisted.',
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      bodyStored: false,
      noRealWrite: true,
    });
    const consoleSummary = ElectronCdpConsoleSummarySchema.parse({
      messageCount: 2,
      warningCount: 1,
      errorCount: 0,
      bodyStored: false,
    });
    const networkSummary = ElectronCdpNetworkMetadataSummarySchema.parse({
      requestCount: 3,
      responseCount: 3,
      failedRequestCount: 0,
      bodyStored: false,
    });
    const eventSummary = ElectronCdpEventMetadataSummarySchema.parse({
      observationWindowMs: 5_000,
      eventCount: 2,
      consoleEventCount: 1,
      networkEventCount: 1,
      payloadHashes: ['sha256:event'],
      bodyStored: false,
      rawPathStored: false,
      noRealWrite: true,
    });
    const plan = ElectronCdpObservationPlanSchema.parse({
      id: 'electron_observation_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'electron-cdp',
      processSummary,
      debugEndpoint: endpoint,
      targets: [target],
      requestedCapabilities: ['target_summary', 'console_summary'],
      forbiddenActions: ['runtime_evaluate', 'generic_cdp_command'],
      blockReasons: [],
      commandDecisions: [commandDecision],
      mainInspectorEnabled: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      screenshotPlanned: false,
      domSnapshotPlanned: false,
      networkBodyStorage: 'forbidden',
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Plan Electron/CDP fixture-only read-only observation.',
    });
    const observationSummary = ElectronCdpObservationSummarySchema.parse({
      id: 'electron_observation_summary_1',
      schemaVersion,
      observedAt: createdAt,
      source: 'electron-cdp.fixture',
      kind: 'electron.cdp.summary',
      severity: 'info',
      planId: plan.id,
      processSummary,
      debugEndpoint: endpoint,
      targets: [target],
      consoleSummary,
      networkSummary,
      eventSummary,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Fixture Electron/CDP observation completed.',
    });
    const evidence = EvidenceRefSchema.parse({
      id: 'electron_evidence_summary_1',
      schemaVersion,
      createdAt,
      kind: 'electron.observation_summary',
      hash: 'sha256:electron-summary',
    });
    const run = ElectronCdpObservationRunSchema.parse({
      id: 'electron_observation_run_1',
      schemaVersion,
      createdAt,
      status: 'completed',
      plan,
      observationSummary,
      evidenceRefs: [evidence],
      auditEventIds: ['audit_electron_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Electron/CDP fixture observation run completed.',
    });

    expect(run.status).toBe('completed');
    expect(plan.mainInspectorEnabled).toBe(false);
    expect(plan.runtimeEvaluateAllowed).toBe(false);
    expect(plan.genericCommandPassthrough).toBe(false);
    expect(target.urlHash).toBe('sha256:url');
    expect(JSON.stringify(run)).not.toContain('C:\\');
    expect(JSON.stringify(run)).not.toContain('Runtime.evaluate');
    expect(() =>
      ElectronProcessSummarySchema.parse({
        ...processSummary,
        executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
      }),
    ).toThrow();
    expect(() =>
      ElectronDebugEndpointSummarySchema.parse({
        ...endpoint,
        loopbackOnly: false,
      }),
    ).toThrow();
    expect(() =>
      ElectronCdpObservationPlanSchema.parse({
        ...plan,
        mainInspectorEnabled: true,
      }),
    ).toThrow();
    expect(() =>
      ElectronCdpCommandAllowlistDecisionSchema.parse({
        ...commandDecision,
        id: 'electron_command_decision_bad',
        command: 'Runtime.evaluate',
        runtimeEvaluateAllowed: true,
      }),
    ).toThrow();
    expect(() =>
      ElectronTargetSummarySchema.parse({
        ...target,
        rawUrl: 'devtools://devtools/bundled/inspector.html?token=secret',
      }),
    ).toThrow();
    expect(() =>
      EvidenceRefSchema.parse({
        id: 'electron_evidence_bad',
        schemaVersion,
        createdAt,
        kind: 'electron.raw_body',
        hash: 'sha256:bad',
      }),
    ).toThrow();
  });

  it('parses electron cdp controlled HTTP control-plane records as metadata only', () => {
    expect(ElectronCdpObservationRunnerModeSchema.options).toEqual([
      'fixture',
      'controlled-local-http',
      'controlled-websocket-events',
    ]);
    expect(ElectronCdpControlPlaneApprovalStatusSchema.options).toEqual([
      'requested',
      'approved',
      'denied',
      'expired',
      'used',
      'revoked',
    ]);

    const endpoint = ElectronDebugEndpointSummarySchema.parse({
      id: 'electron_endpoint_summary_control_1',
      schemaVersion,
      createdAt,
      endpointIdHash: 'sha256:endpoint',
      hostHash: 'sha256:host',
      portHash: 'sha256:port',
      protocol: 'cdp',
      loopbackOnly: true,
      userEnabled: true,
      mainInspectorEnabled: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Loopback endpoint metadata only.',
    });
    const policyDecision = PolicyDecisionSchema.parse({
      id: 'policy_electron_control_1',
      schemaVersion,
      createdAt,
      actionId: 'electron_cdp_observe_1',
      actionType: 'electron.cdp.observe.read_only',
      actionMode: 'read',
      riskLevel: 'medium',
      outcome: 'allow',
      reasons: ['read-only with explicit approval for live local HTTP'],
      requiresDryRun: true,
      requiresApproval: true,
    });
    const evidence = EvidenceRefSchema.parse({
      id: 'electron_evidence_control_1',
      schemaVersion,
      createdAt,
      kind: 'electron.observation_plan',
      hash: 'sha256:evidence',
    });
    const plan = ElectronCdpObservationPlanSchema.parse({
      id: 'electron_observation_plan_control_1',
      schemaVersion,
      createdAt,
      adapterName: 'electron-cdp',
      runnerMode: 'controlled-local-http',
      debugEndpoint: endpoint,
      requestedCapabilities: ['debug_endpoint_summary', 'target_summary'],
      forbiddenActions: [],
      blockReasons: [],
      commandDecisions: [],
      mainInspectorEnabled: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      screenshotPlanned: false,
      domSnapshotPlanned: false,
      networkBodyStorage: 'forbidden',
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryPlanned: true,
      cdpHttpBoundaryInvoked: false,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Controlled HTTP Electron/CDP dry-run stores endpoint hashes only.',
    });
    const timelineEvent = ElectronCdpObservationTimelineEventSchema.parse({
      id: 'electron_timeline_control_1',
      schemaVersion,
      createdAt,
      phase: 'dry-run',
      status: 'planned',
      summary: 'Electron/CDP dry-run planned.',
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_electron_control_1'],
      bodyStored: false,
      rawPathStored: false,
      noRealWrite: true,
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const dryRunRecord = ElectronCdpObservationDryRunRecordSchema.parse({
      id: 'electron_dry_run_record_1',
      schemaVersion,
      createdAt,
      dryRunId: 'electron_dry_run_1',
      status: 'ready',
      plan,
      capabilityDryRun: {
        id: 'electron_capability_dry_run_1',
        schemaVersion,
        createdAt,
        adapterName: 'electron-cdp',
        inputSummary: { endpointIdHash: endpoint.endpointIdHash },
        plannedActions: [
          {
            action: 'electron.cdp.observe.read_only',
            actionMode: 'read',
            risk: 'medium',
            target: endpoint.endpointIdHash,
            requiresApproval: true,
          },
        ],
      },
      policyDecision,
      endpointIdHash: endpoint.endpointIdHash,
      endpointHostHash: endpoint.hostHash,
      endpointPortHash: endpoint.portHash,
      blockReasons: [],
      timeline: [timelineEvent],
      evidenceRefs: [evidence],
      auditEventIds: ['audit_electron_control_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryPlanned: true,
      cdpHttpBoundaryInvoked: false,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Electron/CDP dry-run record stores hashes only.',
    });
    const approvalRecord = ElectronCdpObservationApprovalArtifactRecordSchema.parse({
      id: 'electron_approval_record_1',
      schemaVersion,
      createdAt,
      dryRunId: dryRunRecord.dryRunId,
      dryRunRecordId: dryRunRecord.id,
      approvalRequestId: 'electron_approval_request_1',
      approvalArtifactId: 'electron_approval_artifact_1',
      status: 'approved',
      requestedBy: 'local-operator',
      decidedBy: 'local-operator',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: policyDecision.id,
      policyDecisionHash: 'sha256:policy',
      approved: true,
      requestedAt: createdAt,
      decidedAt: createdAt,
      expiresAt: '2026-04-28T01:00:00.000Z',
      evidenceRefs: [evidence],
      auditEventIds: ['audit_electron_approval_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Electron/CDP approval stores hashes and ids only.',
    });
    const runRecord = ElectronCdpObservationControlPlaneRunSchema.parse({
      id: 'electron_control_run_1',
      schemaVersion,
      createdAt,
      dryRunId: dryRunRecord.dryRunId,
      dryRunRecordId: dryRunRecord.id,
      approvalArtifactId: approvalRecord.approvalArtifactId,
      status: 'completed',
      planId: plan.id,
      endpointIdHash: endpoint.endpointIdHash,
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_electron_run_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      cdpHttpBoundaryInvoked: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Electron/CDP controlled HTTP run completed.',
    });
    const serialized = JSON.stringify({ dryRunRecord, approvalRecord, runRecord });

    expect(dryRunRecord.cdpHttpBoundaryPlanned).toBe(true);
    expect(approvalRecord.approved).toBe(true);
    expect(runRecord.cdpHttpBoundaryInvoked).toBe(true);
    expect(runRecord.processBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('127.0.0.1');
    expect(serialized).not.toContain('localhost');
    expect(serialized).not.toContain('ws://');
    expect(serialized).not.toContain('session=secret');
    expect(() =>
      ElectronCdpObservationDryRunRecordSchema.parse({
        ...dryRunRecord,
        host: '127.0.0.1',
      }),
    ).toThrow();
    expect(() =>
      ElectronCdpObservationControlPlaneRunSchema.parse({
        ...runRecord,
        body: '{"targets":[]}',
      }),
    ).toThrow();
  });

  it('requires capability audit events to carry authority context', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_capability_1',
      schemaVersion,
      createdAt,
      kind: 'audit',
      hash: 'sha256:evidence',
      summary: 'Capability audit evidence',
    });

    const audit = CapabilityAuditEventSchema.parse({
      id: 'audit_capability_1',
      schemaVersion,
      createdAt,
      actor: 'supervisor',
      action: 'capability.execute',
      target: 'codex-cli',
      reason: 'execution authority accepted by workflow gate',
      outcome: 'completed',
      evidenceRefs: [evidence],
      policyDecisionId: 'policy_1',
    });

    expect(audit.target).toBe('codex-cli');
    expect(() =>
      CapabilityAuditEventSchema.parse({
        id: 'audit_capability_invalid',
        schemaVersion,
        createdAt,
        actor: 'supervisor',
        action: 'capability.execute',
        outcome: 'completed',
        evidenceRefs: [evidence],
      }),
    ).toThrow();
  });

  it('parses M6a worktree, patch, PR, and release draft contracts as metadata-only records', () => {
    const worktreeEvidence = EvidenceRefSchema.parse({
      id: 'evidence_worktree_1',
      schemaVersion,
      createdAt,
      kind: 'worktree.plan',
      hash: 'sha256:worktree-plan',
    });
    const patchEvidence = EvidenceRefSchema.parse({
      id: 'evidence_patch_1',
      schemaVersion,
      createdAt,
      kind: 'patch.diff_summary',
      hash: 'sha256:patch',
    });
    const prEvidence = EvidenceRefSchema.parse({
      id: 'evidence_pr_1',
      schemaVersion,
      createdAt,
      kind: 'pr.draft_summary',
      hash: 'sha256:pr',
    });
    const releaseEvidence = EvidenceRefSchema.parse({
      id: 'evidence_release_1',
      schemaVersion,
      createdAt,
      kind: 'release.audit_draft',
      hash: 'sha256:release',
    });

    const plan = WorktreePlanSchema.parse({
      id: 'worktree_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'worktree-manager',
      status: 'planned',
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      worktreeSlugHash: 'sha256:slug',
      defaultRootKind: 'sibling',
      plannedActions: [
        {
          action: 'git.worktree.plan',
          actionMode: 'dry-run',
          risk: 'medium',
          target: 'sha256:path',
          requiresApproval: false,
        },
      ],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryPlanned: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Plan a sibling worktree without invoking git.',
    });
    const run = WorktreeRunSchema.parse({
      id: 'worktree_run_1',
      schemaVersion,
      createdAt,
      planId: plan.id,
      status: 'completed',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      changedFiles: ['packages/contracts/src/index.ts'],
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      evidenceRefs: [worktreeEvidence],
      auditEventIds: ['audit_worktree_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Fixture worktree run completed.',
    });
    const patchRun = PatchRunSchema.parse({
      id: 'patch_run_1',
      schemaVersion,
      createdAt,
      taskId: 'task_1',
      status: 'blocked',
      changedFiles: ['packages/contracts/src/index.ts'],
      diffHash: 'sha256:diff',
      worktreePathHash: 'sha256:path',
      evidenceRefs: [patchEvidence],
      auditEventIds: ['audit_patch_1'],
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Patch is blocked until verification passes.',
    });
    const patchSummary = PatchSummarySchema.parse({
      id: 'patch_summary_1',
      schemaVersion,
      createdAt,
      patchRunId: patchRun.id,
      changedFiles: ['packages/contracts/src/index.ts'],
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      diffLineCount: 12,
      evidenceRefs: [patchEvidence],
      auditEventIds: ['audit_patch_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Patch summary stores the diff hash only.',
    });
    const prDraft = PullRequestSummaryDraftSchema.parse({
      id: 'pr_draft_1',
      schemaVersion,
      createdAt,
      status: 'blocked',
      titleHash: 'sha256:title',
      bodyHash: 'sha256:body',
      sectionCount: 4,
      changedFiles: ['packages/contracts/src/index.ts'],
      evidenceRefs: [prEvidence],
      auditEventIds: ['audit_pr_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'PR draft blocked because verification has not passed.',
    });
    const releaseDraft = ReleaseAuditDraftSchema.parse({
      id: 'release_audit_draft_1',
      schemaVersion,
      createdAt,
      status: 'blocked',
      verificationStatus: 'blocked',
      rollbackNotesHash: 'sha256:rollback',
      riskNotesHash: 'sha256:risk',
      evidenceRefs: [releaseEvidence],
      auditEventIds: ['audit_release_1'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Release audit draft is metadata-only.',
    });

    expect(run.processBoundaryInvoked).toBe(false);
    expect(patchSummary.bodyStored).toBe(false);
    expect(prDraft.status).toBe('blocked');
    expect(releaseDraft.noRealWrite).toBe(true);
    expect(() =>
      WorktreePlanSchema.parse({
        ...plan,
        rawWorktreePath: 'C:\\Users\\Thomas\\CodexHub-worktrees\\feature',
      }),
    ).toThrow();
    expect(() =>
      PatchSummarySchema.parse({
        ...patchSummary,
        rawDiffBody: 'diff --git a/secret b/secret',
      }),
    ).toThrow();
    expect(() =>
      PullRequestSummaryDraftSchema.parse({
        ...prDraft,
        rawPrBody: 'Full PR markdown body',
      }),
    ).toThrow();
    expect(() =>
      WorktreeRunSchema.parse({
        ...run,
        changedFiles: ['../outside.ts'],
      }),
    ).toThrow();
  });

  it('parses M12 controlled patch lifecycle contracts as fixture-only metadata', () => {
    expect(ControlledPatchRejectionReasonSchema.options).toContain('verification_failed');

    const planEvidence = EvidenceRefSchema.parse({
      id: 'evidence_m12_patch_plan',
      schemaVersion,
      createdAt,
      kind: 'patch.lifecycle_plan',
      hash: 'sha256:m12-plan',
    });
    const runEvidence = EvidenceRefSchema.parse({
      id: 'evidence_m12_patch_run',
      schemaVersion,
      createdAt,
      kind: 'patch.lifecycle_run_summary',
      hash: 'sha256:m12-run',
    });
    const reviewEvidence = EvidenceRefSchema.parse({
      id: 'evidence_m12_diff_review',
      schemaVersion,
      createdAt,
      kind: 'patch.diff_review_summary',
      hash: 'sha256:m12-review',
    });
    const readinessEvidence = EvidenceRefSchema.parse({
      id: 'evidence_m12_readiness',
      schemaVersion,
      createdAt,
      kind: 'patch.readiness_summary',
      hash: 'sha256:m12-readiness',
    });
    const plan = ControlledPatchPlanSchema.parse({
      id: 'm12_patch_plan_1',
      schemaVersion,
      createdAt,
      requestIdHash: 'sha256:request',
      worktreeRunIdHash: 'sha256:worktree-run',
      worktreePathHash: 'sha256:worktree-path',
      plannedChangedFileCount: 1,
      plannedChangedFilePathHashes: ['sha256:file'],
      patchBodyHash: 'sha256:patch-body',
      codexPatchAllowed: false,
      fixtureOnly: true,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'M12 fixture patch lifecycle plan stores hashes only.',
    });
    const patchRun = ControlledPatchRunSchema.parse({
      id: 'm12_patch_run_1',
      schemaVersion,
      createdAt,
      planId: plan.id,
      status: 'verified',
      attemptNumber: 1,
      changedFiles: ['packages/contracts/src/index.ts'],
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      diffLineCount: 12,
      diffSummaryHash: 'sha256:diff-summary',
      worktreePathHash: plan.worktreePathHash,
      rejectionReasons: ['none'],
      evidenceRefs: [runEvidence],
      auditEventIds: ['audit_m12_patch_run'],
      fixtureOnly: true,
      codexPatchExecuted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'M12 fixture patch run verified without live execution.',
    });
    const diffReview = DiffReviewSummarySchema.parse({
      id: 'm12_diff_review_1',
      schemaVersion,
      createdAt,
      patchRunId: patchRun.id,
      status: 'passed',
      changedFileCount: 1,
      diffHash: patchRun.diffHash,
      diffLineCount: patchRun.diffLineCount,
      findingCount: 0,
      reviewerLabel: 'fixture-reviewer',
      evidenceRefs: [reviewEvidence],
      auditEventIds: ['audit_m12_diff_review'],
      rawDiffStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Diff review stores counts and hashes only.',
    });
    const readiness = ControlledPatchReadinessSchema.parse({
      id: 'm12_patch_readiness_1',
      schemaVersion,
      createdAt,
      patchRunId: patchRun.id,
      status: 'ready_for_review_draft_only',
      verificationStatus: 'passed',
      changedFileCount: 1,
      blockerCount: 0,
      blockers: [],
      readyForReviewDraftOnly: true,
      pushAllowed: false,
      pullRequestOpened: false,
      evidenceRefs: [readinessEvidence],
      auditEventIds: ['audit_m12_readiness'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Patch is ready only as local PR draft metadata.',
    });
    const lifecycle = ControlledPatchLifecycleRunSchema.parse({
      id: 'm12_patch_lifecycle_run_1',
      schemaVersion,
      createdAt,
      status: 'verified',
      plan,
      patchRun,
      diffReview,
      readiness,
      evidenceRefs: [planEvidence, runEvidence, reviewEvidence, readinessEvidence],
      auditEventIds: [
        'audit_m12_patch_plan',
        'audit_m12_patch_run',
        'audit_m12_diff_review',
        'audit_m12_readiness',
      ],
      evidenceRefIds: [planEvidence.id, runEvidence.id, reviewEvidence.id, readinessEvidence.id],
      auditEventCount: 4,
      fixtureOnly: true,
      codexPatchExecuted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      pushAllowed: false,
      pullRequestOpened: false,
      summary: 'M12 controlled patch lifecycle is fixture-only.',
    });
    const blockedReadiness = ControlledPatchReadinessSchema.parse({
      ...readiness,
      id: 'm12_patch_readiness_blocked',
      status: 'blocked_verification_failed',
      verificationStatus: 'failed',
      blockerCount: 1,
      blockers: ['verification_failed'],
      readyForReviewDraftOnly: false,
    });

    const serialized = JSON.stringify(lifecycle);
    expect(lifecycle.readiness.status).toBe('ready_for_review_draft_only');
    expect(blockedReadiness.status).toBe('blocked_verification_failed');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('Full PR markdown body');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('secret-token');
    expect(() =>
      ControlledPatchLifecycleRunSchema.parse({
        ...lifecycle,
        rawDiffBody: 'diff --git a/private b/private',
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchRunSchema.parse({
        ...patchRun,
        id: 'm12_patch_run_bad_count',
        changedFileCount: 2,
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchPlanSchema.parse({
        ...plan,
        id: 'm12_patch_plan_bad_count',
        plannedChangedFileCount: 2,
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchReadinessSchema.parse({
        ...readiness,
        id: 'm12_patch_readiness_bad_ready',
        changedFileCount: 0,
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchLifecycleRunSchema.parse({
        ...lifecycle,
        patchRun: {
          ...patchRun,
          planId: 'm12_patch_plan_other',
        },
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchLifecycleRunSchema.parse({
        ...lifecycle,
        evidenceRefIds: ['evidence_missing'],
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchPlanSchema.parse({
        ...plan,
        id: 'm12_patch_plan_bad_metadata',
        metadata: { nested: { rawDiff: 'diff --git a/private b/private' } },
      }),
    ).toThrow();
    expect(() =>
      EvidenceRefSchema.parse({
        id: 'evidence_m12_unknown',
        schemaVersion,
        createdAt,
        kind: 'patch.raw_diff_body',
        hash: 'sha256:bad',
      }),
    ).toThrow();
  });

  it('parses M12 governed Codex patch contracts for isolated worktree handoff', () => {
    const planEvidence = EvidenceRefSchema.parse({
      id: 'evidence_codex_patch_plan',
      schemaVersion,
      createdAt,
      kind: 'codex.patch_plan',
      hash: 'sha256:codex-patch-plan',
    });
    const runEvidence = EvidenceRefSchema.parse({
      id: 'evidence_codex_patch_run',
      schemaVersion,
      createdAt,
      kind: 'codex.patch_run_summary',
      hash: 'sha256:codex-patch-run',
    });
    const plan = GovernedCodexPatchPlanSchema.parse({
      id: 'codex_patch_plan_1',
      schemaVersion,
      createdAt,
      mode: 'governed-worktree',
      dryRunIdHash: 'sha256:dry-run',
      policyDecisionIdHash: 'sha256:policy',
      approvalArtifactIdHash: 'sha256:approval',
      worktreeRunIdHash: 'sha256:worktree-run',
      worktreePathHash: 'sha256:worktree-path',
      governedInputHash: 'sha256:governed-input',
      expectedInputHash: 'sha256:expected-input',
      sandboxMode: 'workspace-write-limited',
      writeScope: 'isolated-worktree-only',
      approvalRequired: true,
      persistedApprovalRequired: true,
      hashBoundWorktreeRequired: true,
      repoRootWriteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPromptStored: false,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryPlanned: true,
      externalProcessStarted: false,
      evidenceRefs: [planEvidence],
      summary: 'Codex patch is governed and limited to the approved isolated worktree.',
    });
    const run = GovernedCodexPatchRunSchema.parse({
      id: 'codex_patch_run_1',
      schemaVersion,
      createdAt,
      planId: plan.id,
      mode: 'governed-worktree',
      status: 'completed',
      changedFiles: ['packages/orchestrator-kernel/src/m12-patch-lifecycle.ts'],
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      diffLineCount: 42,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      codexPatchExecuted: true,
      realWriteExecuted: true,
      writeScope: 'isolated-worktree-only',
      repoRootWriteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawStdoutStored: false,
      rawStderrStored: false,
      rawDiffStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceRefs: [runEvidence],
      auditEventIds: ['audit_codex_patch_run'],
      summary: 'Codex patch completed inside the isolated worktree only.',
    });
    const serialized = JSON.stringify({ plan, run });

    expect(run.codexPatchExecuted).toBe(true);
    expect(run.realWriteExecuted).toBe(true);
    expect(run.repoRootWriteAllowed).toBe(false);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('Full PR markdown body');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('secret-token');
    expect(() =>
      GovernedCodexPatchPlanSchema.parse({
        ...plan,
        id: 'codex_patch_plan_bad_boundary',
        processBoundaryPlanned: false,
      }),
    ).toThrow();
    expect(() =>
      GovernedCodexPatchRunSchema.parse({
        ...run,
        id: 'codex_patch_run_bad_count',
        changedFileCount: 2,
      }),
    ).toThrow();
    expect(() =>
      GovernedCodexPatchRunSchema.parse({
        ...run,
        id: 'codex_patch_run_missing_boundary',
        processBoundaryInvoked: false,
      }),
    ).toThrow();
    expect(() =>
      GovernedCodexPatchRunSchema.parse({
        ...run,
        id: 'codex_patch_run_raw_metadata',
        metadata: { nested: { rawDiff: 'diff --git a/private b/private' } },
      }),
    ).toThrow();
  });

  it('parses M12 verification gate contracts and only allows draft readiness after passed verification', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_m12c_verification',
      schemaVersion,
      createdAt,
      kind: 'verification.run_summary',
      hash: 'sha256:m12c-verification',
    });
    const gate = ControlledPatchVerificationGateSchema.parse({
      id: 'm12c_verification_gate_1',
      schemaVersion,
      createdAt,
      patchRunId: 'm12b_patch_run_1',
      lifecycleRunIdHash: 'sha256:lifecycle-run',
      verificationRunId: 'verification_run_1',
      verificationStatus: 'passed',
      targets: ['lint', 'test', 'build'],
      changedFileCount: 2,
      affectedProjectCount: 2,
      commandResultCount: 2,
      readyForReviewDraftOnly: true,
      pushAllowed: false,
      pullRequestOpened: false,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      evidenceRefs: [evidence],
      auditEventIds: ['audit_m12c_verification'],
      metadata: {
        m12c: true,
        commandOutputStored: false,
      },
      summary: 'M12c verification gate passed; local draft readiness is allowed.',
    });
    const serialized = JSON.stringify(gate);

    expect(gate.readyForReviewDraftOnly).toBe(true);
    expect(() =>
      ControlledPatchVerificationGateSchema.parse({
        ...gate,
        id: 'm12c_verification_gate_bad_ready',
        verificationStatus: 'failed',
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchVerificationGateSchema.parse({
        ...gate,
        id: 'm12c_verification_gate_bad_empty_patch',
        changedFileCount: 0,
      }),
    ).toThrow();
    expect(() =>
      ControlledPatchVerificationGateSchema.parse({
        ...gate,
        id: 'm12c_verification_gate_raw_metadata',
        metadata: { rawStdout: 'Successfully ran target lint,test,build' },
      }),
    ).toThrow();
    expect(serialized).not.toContain('Successfully ran target');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('secret-token');
  });

  it('parses M6b worktree control-plane records and keeps raw bodies out', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_worktree_m6b',
      schemaVersion,
      createdAt,
      kind: 'worktree.run_summary',
      hash: 'sha256:worktree-run',
    });
    const plan = WorktreePlanSchema.parse({
      id: 'worktree_plan_m6b',
      schemaVersion,
      createdAt,
      adapterName: 'worktree-manager',
      status: 'planned',
      runnerMode: 'controlled-git-worktree',
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      worktreeSlugHash: 'sha256:slug',
      baseRefHash: 'sha256:base',
      commandSummaryHash: 'sha256:command',
      defaultRootKind: 'sibling',
      plannedActions: [
        {
          action: 'git.worktree.create.real',
          actionMode: 'write',
          risk: 'high',
          target: 'sha256:path',
          requiresApproval: true,
        },
      ],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
      cleanupRequired: false,
      cleanupDeferred: false,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Controlled git plan.',
    });
    const policyDecision = PolicyDecisionSchema.parse({
      id: 'policy_worktree_m6b',
      schemaVersion,
      createdAt,
      actionId: plan.id,
      actionType: 'git.worktree.create',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['real write action requires explicit approval'],
      requiresDryRun: true,
      requiresApproval: true,
    });
    const dryRun = WorktreeDryRunRecordSchema.parse({
      id: plan.id,
      dryRunId: plan.id,
      schemaVersion,
      createdAt,
      status: 'ready',
      plan,
      capabilityDryRun: {
        id: 'capability_dry_run_worktree_m6b',
        schemaVersion,
        createdAt,
        adapterName: 'worktree-manager',
        inputSummary: { worktreePathHash: 'sha256:path' },
        plannedActions: plan.plannedActions,
      },
      policyDecision,
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      worktreeSlugHash: 'sha256:slug',
      baseRefHash: 'sha256:base',
      timeline: [],
      evidenceRefs: [evidence],
      auditEventIds: ['audit_worktree_m6b'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'M6b dry-run ready.',
    });
    const approval = WorktreeApprovalArtifactRecordSchema.parse({
      id: 'worktree_approval_record_m6b',
      schemaVersion,
      createdAt,
      dryRunId: dryRun.dryRunId,
      dryRunRecordId: dryRun.id,
      approvalRequestId: 'worktree_approval_request_m6b',
      approvalArtifactId: 'worktree_approval_artifact_m6b',
      status: 'approved',
      requestedBy: 'local-operator',
      decidedBy: 'local-operator',
      dryRunPlanHash: 'sha256:plan',
      policyDecisionId: policyDecision.id,
      policyDecisionHash: 'sha256:policy',
      approved: true,
      requestedAt: createdAt,
      decidedAt: createdAt,
      expiresAt: '2026-04-28T01:00:00.000Z',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Approved.',
    });
    const worktreeRun = WorktreeRunSchema.parse({
      id: 'worktree_run_m6b',
      schemaVersion,
      createdAt,
      planId: plan.id,
      status: 'completed',
      runnerMode: 'controlled-git-worktree',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      baseRefHash: 'sha256:base',
      commandSummaryHash: 'sha256:command',
      changedFiles: ['packages/contracts/src/index.ts'],
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      evidenceRefs: [evidence],
      auditEventIds: ['audit_worktree_m6b'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: false,
      gitProcessBoundaryInvoked: true,
      cleanupRequired: true,
      cleanupDeferred: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'Controlled git worktree completed.',
    });
    const run = WorktreeControlPlaneRunSchema.parse({
      id: 'worktree_control_run_m6b',
      schemaVersion,
      createdAt,
      dryRunId: dryRun.dryRunId,
      dryRunRecordId: dryRun.id,
      approvalArtifactId: approval.approvalArtifactId,
      status: 'completed',
      planId: plan.id,
      runnerMode: 'controlled-git-worktree',
      worktreeRun,
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      branchNameHash: 'sha256:branch',
      worktreeSlugHash: 'sha256:slug',
      baseRefHash: 'sha256:base',
      changedFileCount: 1,
      diffHash: 'sha256:diff',
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_worktree_m6b'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: false,
      cleanupRequired: true,
      cleanupDeferred: true,
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'M6b controlled git run completed.',
    });

    expect(dryRun.gitProcessBoundaryPlanned).toBe(true);
    expect(approval.approved).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(() =>
      WorktreeControlPlaneRunSchema.parse({
        ...run,
        rawDiffBody: 'diff --git a/private b/private',
      }),
    ).toThrow();
    expect(() =>
      WorktreeDryRunRecordSchema.parse({
        ...dryRun,
        rawWorktreePath: 'C:\\Users\\Thomas\\CodexHub-worktrees\\feature',
      }),
    ).toThrow();
  });

  it('parses M6c worktree cleanup control-plane records and keeps raw bodies out', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_worktree_cleanup_m6c',
      schemaVersion,
      createdAt,
      kind: 'worktree.cleanup_summary',
      hash: 'sha256:worktree-cleanup',
    });
    const plan = WorktreeCleanupPlanSchema.parse({
      id: 'worktree_cleanup_plan_m6c',
      schemaVersion,
      createdAt,
      adapterName: 'worktree-manager',
      sourceRunId: 'worktree_control_run_m6b',
      status: 'planned',
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      sourceRunHash: 'sha256:source-run',
      commandSummaryHash: 'sha256:command',
      plannedActions: [
        {
          action: 'git.worktree.cleanup.remove',
          actionMode: 'write',
          risk: 'high',
          target: 'sha256:path',
          requiresApproval: true,
        },
      ],
      dirtyCheckPlanned: true,
      cleanupDeletePlanned: true,
      cleanupRequired: true,
      cleanupDeferred: true,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'Cleanup planned.',
    });
    const policyDecision = PolicyDecisionSchema.parse({
      id: 'policy_worktree_cleanup_m6c',
      schemaVersion,
      createdAt,
      actionId: plan.id,
      actionType: 'git.worktree.cleanup',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['real write action requires explicit approval'],
      requiresDryRun: true,
      requiresApproval: true,
    });
    const dryRun = WorktreeCleanupDryRunRecordSchema.parse({
      id: plan.id,
      dryRunId: plan.id,
      schemaVersion,
      createdAt,
      sourceRunId: plan.sourceRunId,
      status: 'ready',
      plan,
      capabilityDryRun: {
        id: 'capability_dry_run_worktree_cleanup_m6c',
        schemaVersion,
        createdAt,
        adapterName: 'worktree-manager',
        inputSummary: { worktreePathHash: 'sha256:path' },
        plannedActions: plan.plannedActions,
      },
      policyDecision,
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      sourceRunHash: 'sha256:source-run',
      timeline: [],
      evidenceRefs: [evidence],
      auditEventIds: ['audit_worktree_cleanup_m6c'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      summary: 'M6c cleanup dry-run ready.',
    });
    const approval = WorktreeCleanupApprovalArtifactRecordSchema.parse({
      id: 'worktree_cleanup_approval_record_m6c',
      schemaVersion,
      createdAt,
      dryRunId: dryRun.dryRunId,
      dryRunRecordId: dryRun.id,
      sourceRunId: dryRun.sourceRunId,
      approvalRequestId: 'worktree_cleanup_approval_request_m6c',
      approvalArtifactId: 'worktree_cleanup_approval_artifact_m6c',
      status: 'approved',
      requestedBy: 'local-operator',
      decidedBy: 'local-operator',
      dryRunPlanHash: 'sha256:plan',
      policyDecisionId: policyDecision.id,
      policyDecisionHash: 'sha256:policy',
      approved: true,
      requestedAt: createdAt,
      decidedAt: createdAt,
      expiresAt: '2026-04-28T01:00:00.000Z',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Cleanup approved.',
    });
    const cleanupRun = WorktreeCleanupRunSchema.parse({
      id: 'worktree_cleanup_run_m6c',
      schemaVersion,
      createdAt,
      planId: plan.id,
      dryRunId: dryRun.dryRunId,
      sourceRunId: dryRun.sourceRunId,
      status: 'completed',
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      sourceRunHash: 'sha256:source-run',
      commandSummaryHash: 'sha256:command',
      dirtyFileCount: 0,
      cleanupAttempted: true,
      cleanupCompleted: true,
      cleanupRequired: false,
      cleanupDeferred: false,
      evidenceRefs: [evidence],
      auditEventIds: ['audit_worktree_cleanup_m6c'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: false,
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'Cleanup completed.',
    });
    const run = WorktreeCleanupControlPlaneRunSchema.parse({
      id: 'worktree_cleanup_control_run_m6c',
      schemaVersion,
      createdAt,
      dryRunId: dryRun.dryRunId,
      dryRunRecordId: dryRun.id,
      sourceRunId: dryRun.sourceRunId,
      approvalArtifactId: approval.approvalArtifactId,
      status: 'completed',
      planId: plan.id,
      cleanupRun,
      repoRootHash: 'sha256:repo',
      worktreeRootHash: 'sha256:root',
      worktreePathHash: 'sha256:path',
      sourceRunHash: 'sha256:source-run',
      dirtyFileCount: 0,
      cleanupAttempted: true,
      cleanupCompleted: true,
      cleanupRequired: false,
      cleanupDeferred: false,
      evidenceRefIds: [evidence.id],
      auditEventIds: ['audit_worktree_cleanup_m6c'],
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: false,
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'M6c cleanup control-plane completed.',
    });

    expect(approval.sourceRunId).toBe(dryRun.sourceRunId);
    expect(run.cleanupCompleted).toBe(true);
    expect(run.cleanupRequired).toBe(false);
    expect(() =>
      WorktreeCleanupControlPlaneRunSchema.parse({
        ...run,
        rawCommandBody: 'git worktree remove C:\\Users\\Thomas\\CodexHub-worktrees\\feature',
      }),
    ).toThrow();
    expect(() =>
      WorktreeCleanupDryRunRecordSchema.parse({
        ...dryRun,
        rawWorktreePath: 'C:\\Users\\Thomas\\CodexHub-worktrees\\feature',
      }),
    ).toThrow();
  });

  it('parses M7 policy backend and telemetry foundation contracts as metadata-only', () => {
    expect(PolicyBackendKindSchema.options).toEqual(['opa', 'cedar', 'fixture']);
    expect(PolicyBackendEvaluatorSourceSchema.options).toEqual([
      'fixture-inline',
      'fixture-config',
    ]);
    expect(TelemetryExporterKindSchema.options).toEqual(['noop', 'fixture']);
    expect(TelemetrySignalKindSchema.options).toEqual(['trace', 'metric', 'log']);

    const policyEvidence = EvidenceRefSchema.parse({
      id: 'evidence_policy_backend_1',
      schemaVersion,
      createdAt,
      kind: 'policy_backend.raw_evaluation_summary',
      hash: 'sha256:policy-raw',
    });
    const normalizedEvidence = EvidenceRefSchema.parse({
      id: 'evidence_policy_backend_normalized_1',
      schemaVersion,
      createdAt,
      kind: 'policy_backend.normalized_decision_trace',
      hash: 'sha256:policy-normalized',
    });
    const telemetryEvidence = EvidenceRefSchema.parse({
      id: 'evidence_telemetry_span_1',
      schemaVersion,
      createdAt,
      kind: 'telemetry.span_summary',
      hash: 'sha256:span',
    });

    const policyPlan = PolicyBackendEvaluationPlanSchema.parse({
      id: 'policy_backend_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'policy-backend-adapter',
      backendKind: 'fixture',
      evaluatorSource: 'fixture-config',
      actionIdHash: 'sha256:action',
      actionType: 'git.worktree.create',
      actionMode: 'read',
      riskLevel: 'low',
      inputHash: 'sha256:input',
      policySourceHash: 'sha256:policy-source',
      fixtureConfigHash: 'sha256:fixture-config',
      fixtureRuleCount: 2,
      processBoundaryPlanned: false,
      networkBoundaryPlanned: false,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Fixture policy backend evaluation plan.',
    });
    const rawEvaluation = PolicyBackendRawEvaluationSummarySchema.parse({
      id: 'policy_backend_raw_1',
      schemaVersion,
      createdAt,
      planId: policyPlan.id,
      backendKind: 'fixture',
      evaluatorSource: 'fixture-config',
      status: 'completed',
      rawOutcome: 'deny',
      rawEvaluationHash: 'sha256:raw-eval',
      reasonCount: 1,
      matchedRuleCount: 1,
      policySourceHash: 'sha256:policy-source',
      fixtureConfigHash: 'sha256:fixture-config',
      fixtureRuleCount: 2,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'Raw backend evaluation is advisory.',
    });
    const normalizedTrace = PolicyBackendNormalizedDecisionTraceSchema.parse({
      id: 'policy_backend_trace_1',
      schemaVersion,
      createdAt,
      planId: policyPlan.id,
      rawEvaluationSummaryId: rawEvaluation.id,
      codexhubPolicyDecisionId: 'policy_codexhub_1',
      policyDecisionHash: 'sha256:codexhub-policy',
      backendKind: 'fixture',
      evaluatorSource: 'fixture-config',
      backendOutcome: 'deny',
      normalizedOutcome: 'allow',
      authorityProvider: 'codexhub',
      backendAdvisoryOnly: true,
      evidenceRefs: [normalizedEvidence],
      auditEventIds: ['audit_policy_backend_1'],
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      summary: 'CodexHub policy decision remains authoritative.',
    });
    const policyRun = PolicyBackendEvaluationRunSchema.parse({
      id: 'policy_backend_run_1',
      schemaVersion,
      createdAt,
      status: 'completed',
      plan: policyPlan,
      rawEvaluationSummary: rawEvaluation,
      normalizedDecisionTrace: normalizedTrace,
      evidenceRefs: [policyEvidence, normalizedEvidence],
      auditEventIds: ['audit_policy_backend_1'],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Policy backend fixture evaluation completed.',
    });
    const span = TelemetrySpanSummarySchema.parse({
      id: 'telemetry_span_1',
      schemaVersion,
      createdAt,
      signalKind: 'trace',
      spanKind: 'workflow',
      traceIdHash: 'sha256:trace',
      spanIdHash: 'sha256:span',
      nameHash: 'sha256:name',
      durationMs: 12,
      attributeCount: 3,
      eventCount: 1,
      linkCount: 0,
      payloadHash: 'sha256:payload',
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      evidenceAuditAuthoritative: false,
      summary: 'Workflow span metadata only.',
    });
    const tracePlan = TelemetryTraceExportPlanSchema.parse({
      id: 'telemetry_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'otel-adapter',
      exporterKind: 'noop',
      signalKinds: ['trace'],
      spanCount: 1,
      tracePlanHash: 'sha256:trace-plan',
      networkExportPlanned: false,
      processBoundaryPlanned: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      evidenceAuditAuthoritative: false,
      summary: 'Noop trace export plan.',
    });
    const telemetryRun = TelemetryExportRunSchema.parse({
      id: 'telemetry_run_1',
      schemaVersion,
      createdAt,
      status: 'completed',
      planId: tracePlan.id,
      exporterKind: 'noop',
      spans: [span],
      exportedSpanCount: 1,
      exportSummaryHash: 'sha256:export',
      evidenceRefs: [telemetryEvidence],
      auditEventIds: ['audit_telemetry_1'],
      networkExportAttempted: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      evidenceAuditAuthoritative: false,
      summary: 'Noop telemetry export completed.',
    });

    expect(policyRun.normalizedDecisionTrace?.authorityProvider).toBe('codexhub');
    expect(policyRun.normalizedDecisionTrace?.backendAdvisoryOnly).toBe(true);
    expect(telemetryRun.evidenceAuditAuthoritative).toBe(false);
    expect(telemetryRun.networkExportAttempted).toBe(false);
    expect(() =>
      PolicyBackendEvaluationPlanSchema.parse({
        ...policyPlan,
        rawPolicySource: 'package codexhub.authz',
      }),
    ).toThrow();
    expect(() =>
      TelemetrySpanSummarySchema.parse({
        ...span,
        rawTracePayload: '{"token":"secret"}',
      }),
    ).toThrow();
    expect(() =>
      EvidenceRefSchema.parse({
        id: 'evidence_bad_m7',
        schemaVersion,
        createdAt,
        kind: 'telemetry.raw_payload',
        hash: 'sha256:bad',
      }),
    ).toThrow();
  });

  it('parses unified governance projection contracts as metadata-only', () => {
    expect(UnifiedRunSourceSchema.options).toEqual([
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

    const evidenceBundle = EvidenceBundleProjectionSchema.parse({
      id: 'evidence_bundle_projection_1',
      schemaVersion,
      createdAt,
      runProjectionId: 'unified_run_projection_1',
      source: 'worktree',
      evidenceRefIds: ['evidence_worktree_1'],
      evidenceCount: 1,
      evidenceKinds: ['worktree.run_summary'],
      bundleHash: 'sha256:evidence-bundle',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Evidence bundle stores ids, hashes, counts, and kinds only.',
    });
    const auditChain = AuditChainProjectionSchema.parse({
      id: 'audit_chain_projection_1',
      schemaVersion,
      createdAt,
      runProjectionId: 'unified_run_projection_1',
      source: 'worktree',
      auditEventIds: ['audit_worktree_1'],
      auditEventCount: 1,
      policyDecisionIds: ['policy_worktree_1'],
      chainHash: 'sha256:audit-chain',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Audit chain stores ids, hashes, and counts only.',
    });
    const timelineEvent = UnifiedTimelineEventSchema.parse({
      id: 'unified_timeline_event_1',
      schemaVersion,
      createdAt,
      runProjectionId: 'unified_run_projection_1',
      source: 'worktree',
      phase: 'worktree.summary',
      status: 'completed',
      order: 0,
      evidenceRefIds: evidenceBundle.evidenceRefIds,
      auditEventIds: auditChain.auditEventIds,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Worktree summary projected without raw data.',
    });
    const projection = UnifiedRunProjectionSchema.parse({
      id: 'unified_run_projection_1',
      schemaVersion,
      createdAt,
      source: 'worktree',
      sourceRunIdHash: 'sha256:source-run',
      titleHash: 'sha256:title',
      status: 'completed',
      timeline: [timelineEvent],
      evidenceBundle,
      auditChain,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      networkBoundaryInvoked: false,
      noRealWrite: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Unified worktree run projection.',
    });
    const summary = GovernanceProjectionSummarySchema.parse({
      id: 'governance_projection_summary_1',
      schemaVersion,
      createdAt,
      status: 'ready',
      runCount: 1,
      sourceBreakdown: { worktree: 1 },
      evidenceCount: 1,
      auditEventCount: 1,
      processBoundaryCount: 1,
      externalProcessStartedCount: 1,
      networkBoundaryCount: 0,
      projectionHash: 'sha256:projection',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Governance projection summary stores metadata only.',
    });

    expect(projection.timeline).toHaveLength(1);
    expect(summary.sourceBreakdown.worktree).toBe(1);
    expect(JSON.stringify(projection)).not.toContain('diff --git');
    expect(JSON.stringify(projection)).not.toContain('C:/');
    expect(JSON.stringify(projection)).not.toContain('stdout');
    expect(JSON.stringify(projection)).not.toContain('stderr');
    expect(() =>
      UnifiedRunProjectionSchema.parse({
        ...projection,
        id: 'unified_run_projection_bad_metadata',
        metadata: { requestBody: 'raw body' },
      }),
    ).toThrow();
    expect(() =>
      UnifiedRunProjectionSchema.parse({
        ...projection,
        id: 'unified_run_projection_bad_field',
        rawDiff: 'diff --git a/file',
      }),
    ).toThrow();
  });

  it('parses operator readiness contracts as metadata-only', () => {
    expect(OperatorReadinessStatusSchema.options).toEqual([
      'pass',
      'warn',
      'fail',
      'unknown',
    ]);

    const configHash = ConfigHashSummarySchema.parse({
      id: 'config_hash_summary_1',
      schemaVersion,
      createdAt,
      name: 'integrations',
      kind: 'integration',
      configured: true,
      hash: 'config:abc123',
      itemCount: 8,
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Integration config is present and summarized by hash.',
    });
    const integration = IntegrationReadinessSummarySchema.parse({
      id: 'integration_readiness_codex',
      schemaVersion,
      createdAt,
      name: 'codex-cli',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'medium',
      approvalRequired: true,
      evidenceRequired: true,
      auditRequired: true,
      processBoundary: true,
      networkBoundary: false,
      safeToEnable: true,
      envFlagConfigured: true,
      localControlKeyConfigured: true,
      configHash: configHash.hash,
      blockers: [],
      safeEnableNotes: ['Persisted approval remains required for execution.'],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Codex CLI is configured for governed execution.',
    });
    const check = OperatorReadinessCheckSchema.parse({
      id: 'operator_readiness_check_1',
      schemaVersion,
      createdAt,
      code: 'local_control_key_present',
      label: 'Local control key configured',
      category: 'security',
      status: 'pass',
      required: true,
      configured: true,
      hash: 'env:configured',
      blockers: [],
      safeEnableNotes: ['Configured value is never displayed.'],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Required local-control key is configured.',
    });
    const report = OperatorReadinessReportSchema.parse({
      id: 'operator_readiness_report_1',
      schemaVersion,
      createdAt,
      status: 'pass',
      checks: [check],
      integrations: [integration],
      configHashes: [configHash],
      passedCheckCount: 1,
      warningCheckCount: 0,
      failedCheckCount: 0,
      unknownCheckCount: 0,
      configuredLocalControlKeyCount: 1,
      storeAvailable: true,
      processBoundaryAllowlistPassed: true,
      policyConfigHash: 'config:policy',
      riskConfigHash: 'config:risk',
      integrationConfigHash: configHash.hash,
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Operator readiness report stores hashes and statuses only.',
    });

    const serialized = JSON.stringify(report);
    expect(report.status).toBe('pass');
    expect(report.integrations[0]?.name).toBe('codex-cli');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('raw config body');
    expect(() =>
      OperatorReadinessReportSchema.parse({
        ...report,
        id: 'operator_readiness_report_bad_metadata',
        metadata: { rawValue: 'secret-value' },
      }),
    ).toThrow();
    expect(() =>
      OperatorReadinessCheckSchema.parse({
        ...check,
        id: 'operator_readiness_check_bad_field',
        rawEnv: 'secret-value',
      }),
    ).toThrow();
  });

  it('parses M10 pilot checklist and runbook contracts as metadata-only', () => {
    expect(M10PilotChecklistStatusSchema.options).toEqual(['ready', 'blocked', 'review']);
    expect(M10PilotOperatorStepPhaseSchema.options).toEqual([
      'preflight',
      'approval',
      'pilot',
      'verification',
      'review',
      'rollback',
    ]);
    expect(M10PilotOperatorStepStatusSchema.options).toEqual([
      'ready',
      'blocked',
      'review',
      'done',
    ]);

    const step = M10PilotOperatorStepSchema.parse({
      id: 'm10_pilot_step_1',
      schemaVersion,
      createdAt,
      code: 'doctor_preflight',
      label: 'Doctor preflight',
      phase: 'preflight',
      status: 'blocked',
      required: true,
      blockerCount: 1,
      blockers: ['worktree_manager_disabled'],
      safeEnableNotes: ['Resolve blockers before running the pilot.'],
      evidenceRefIds: [],
      auditEventIds: [],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'Operator preflight stores only status and blocker metadata.',
    });
    const checklist = M10PilotChecklistSchema.parse({
      id: 'm10_pilot_checklist_1',
      schemaVersion,
      createdAt,
      status: 'blocked',
      steps: [step],
      readyStepCount: 0,
      blockedStepCount: 1,
      reviewStepCount: 0,
      requiredStepCount: 1,
      blockerCount: 1,
      integrationCount: 8,
      configuredLocalControlKeyCount: 0,
      governanceRunCount: 0,
      approvalInboxItemCount: 0,
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'M10 pilot checklist is blocked until operator prerequisites are ready.',
    });
    const runbook = M10PilotRunbookSummarySchema.parse({
      id: 'm10_pilot_runbook_1',
      schemaVersion,
      createdAt,
      checklistId: checklist.id,
      status: checklist.status,
      phaseCount: 6,
      requiredStepCount: checklist.requiredStepCount,
      blockerCount: checklist.blockerCount,
      nextAction: 'Resolve checklist blockers before enabling the local pilot.',
      rollbackSummary: 'Disable pilot flags and use governed cleanup metadata if needed.',
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'Runbook summary is read-only and does not execute the pilot.',
    });
    const serialized = JSON.stringify({ checklist, runbook });

    expect(checklist.status).toBe('blocked');
    expect(runbook.checklistId).toBe(checklist.id);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout body');
    expect(serialized).not.toContain('stderr body');
    expect(serialized).not.toContain('diff --git');
    expect(() =>
      M10PilotOperatorStepSchema.parse({
        ...step,
        id: 'm10_pilot_step_bad_token',
        localControlKeyRead: true,
      }),
    ).toThrow();
    expect(() =>
      M10PilotChecklistSchema.parse({
        ...checklist,
        id: 'm10_pilot_checklist_bad_raw',
        rawEnv: 'secret-value',
      }),
    ).toThrow();
    expect(() =>
      M10PilotRunbookSummarySchema.parse({
        ...runbook,
        id: 'm10_pilot_runbook_bad_metadata',
        metadata: { rawEnv: 'secret-value' },
      }),
    ).toThrow();
  });

  it('parses M11 pilot enablement contracts as metadata-only', () => {
    expect(M11PilotEnablementStatusSchema.options).toEqual(['ready', 'blocked', 'review']);
    expect(M11PilotEnablementStepPhaseSchema.options).toEqual([
      'preflight',
      'approval',
      'worktree',
      'codex',
      'verification',
      'projection',
      'rollback',
    ]);
    expect(M11PilotEnablementStepStatusSchema.options).toEqual([
      'ready',
      'blocked',
      'review',
      'done',
    ]);

    const step = M11PilotEnablementStepSchema.parse({
      id: 'm11_enablement_step_1',
      schemaVersion,
      createdAt,
      code: 'm11_env_flags',
      label: 'M11 pilot env flags',
      phase: 'preflight',
      status: 'blocked',
      required: true,
      blockerCount: 1,
      blockers: ['m11_pilot_env_flag_missing'],
      safeEnableNotes: ['Enable only for a local pilot session.'],
      evidenceRefIds: [],
      auditEventIds: [],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'M11 enablement records blocker metadata only.',
    });
    const checklist = M11PilotEnablementChecklistSchema.parse({
      id: 'm11_enablement_checklist_1',
      schemaVersion,
      createdAt,
      status: 'blocked',
      steps: [step],
      readyStepCount: 0,
      blockedStepCount: 1,
      reviewStepCount: 0,
      requiredStepCount: 1,
      blockerCount: 1,
      integrationCount: 8,
      configuredLocalControlKeyCount: 0,
      governanceRunCount: 0,
      approvalInboxItemCount: 0,
      latestRunCount: 0,
      cleanupRequiredCount: 0,
      requiredEnvFlags: [
        'CODEXHUB_M11_PRODUCTION_PILOT_ENABLED',
        'CODEXHUB_WORKTREE_MANAGER_ENABLED',
      ],
      safeEnableBlockers: ['m11_pilot_env_flag_missing'],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      summary: 'M11 pilot enablement is blocked until prerequisites are ready.',
    });
    const runbook = M11PilotEnablementRunbookSummarySchema.parse({
      id: 'm11_enablement_runbook_1',
      schemaVersion,
      createdAt,
      checklistId: checklist.id,
      status: checklist.status,
      phaseCount: 7,
      requiredStepCount: checklist.requiredStepCount,
      blockerCount: checklist.blockerCount,
      nextAction: 'Resolve M11 pilot blockers before using the gated route.',
      safeEnableSummary: 'Use env flags, persisted approval, and hash-bound runtime input.',
      failureHandlingSummary: 'Inspect failure classification and cleanup handoff metadata.',
      rollbackSummary: 'Disable pilot flags and use governed cleanup if required.',
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'M11 enablement runbook is read-only.',
    });
    const serialized = JSON.stringify({ checklist, runbook });

    expect(checklist.codexReadOnlyDryRunOnly).toBe(true);
    expect(checklist.patchGenerationAllowed).toBe(false);
    expect(runbook.checklistId).toBe(checklist.id);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout body');
    expect(serialized).not.toContain('stderr body');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(() =>
      M11PilotEnablementChecklistSchema.parse({
        ...checklist,
        id: 'm11_enablement_checklist_bad_patch',
        patchGenerationAllowed: true,
      }),
    ).toThrow();
    expect(() =>
      M11PilotEnablementStepSchema.parse({
        ...step,
        id: 'm11_enablement_step_bad_token',
        localControlKeyRead: true,
      }),
    ).toThrow();
    expect(() =>
      M11PilotEnablementRunbookSummarySchema.parse({
        ...runbook,
        id: 'm11_enablement_runbook_bad_metadata',
        metadata: { rawEnv: 'secret-value' },
      }),
    ).toThrow();
  });

  it('parses golden path rehearsal contracts as metadata-only', () => {
    expect(GoldenPathStepStatusSchema.options).toEqual([
      'planned',
      'running',
      'passed',
      'ready',
      'completed',
      'failed',
      'blocked',
      'aborted',
    ]);

    const step = GoldenPathStepSchema.parse({
      id: 'golden_path_step_1',
      schemaVersion,
      createdAt,
      phase: 'worktree.fixture',
      status: 'completed',
      order: 0,
      evidenceRefIds: ['evidence_worktree_1'],
      auditEventIds: ['audit_worktree_1'],
      rawPathStored: false,
      bodyStored: false,
      summary: 'Worktree fixture completed without raw path storage.',
    });
    const evidenceBundle = GoldenPathEvidenceBundleSchema.parse({
      id: 'golden_path_evidence_bundle_1',
      schemaVersion,
      createdAt,
      rehearsalRunId: 'golden_path_rehearsal_1',
      evidenceRefIds: step.evidenceRefIds,
      auditEventIds: step.auditEventIds,
      evidenceCount: 1,
      auditEventCount: 1,
      bundleHash: 'golden:bundle',
      rawPathStored: false,
      bodyStored: false,
      summary: 'Golden path evidence bundle stores ids and hashes only.',
    });
    const run = GoldenPathRehearsalRunSchema.parse({
      id: 'golden_path_rehearsal_1',
      schemaVersion,
      createdAt,
      status: 'passed',
      scenario: 'all-pass',
      requestId: 'development_request_1',
      requestTitleHash: 'golden:title',
      requestDescriptionHash: 'golden:description',
      steps: [step],
      evidenceBundle,
      telemetryProjectionHash: 'golden:telemetry',
      prDraftStatus: 'ready',
      releaseAuditStatus: 'ready',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: true,
      telemetryAuthoritative: false,
      pushAllowed: false,
      pullRequestOpened: false,
      summary: 'Golden path rehearsal passed with fixture metadata only.',
    });

    const serialized = JSON.stringify(run);
    expect(run.steps).toHaveLength(1);
    expect(run.evidenceBundle.evidenceCount).toBe(1);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(() =>
      GoldenPathRehearsalRunSchema.parse({
        ...run,
        id: 'golden_path_rehearsal_bad_metadata',
        metadata: { requestBody: 'raw body' },
      }),
    ).toThrow();
  });

  it('parses M10 pilot acceptance rehearsal contracts as fixture-only metadata', () => {
    expect(M10PilotAcceptanceScenarioSchema.options).toEqual([
      'all-pass',
      'readiness-blocked',
      'approval-blocked',
      'codex-failed',
      'nx-failed',
    ]);

    const step = M10PilotAcceptanceStepSchema.parse({
      id: 'm10_acceptance_step_1',
      schemaVersion,
      createdAt,
      code: 'doctor_preflight',
      phase: 'doctor',
      status: 'passed',
      order: 0,
      evidenceRefIds: ['evidence_m10_doctor'],
      auditEventIds: ['audit_m10_doctor'],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'M10 acceptance doctor step passed with metadata only.',
    });
    const evidenceSummary = M10PilotAcceptanceEvidenceSummarySchema.parse({
      id: 'm10_acceptance_evidence_summary_1',
      schemaVersion,
      createdAt,
      rehearsalRunId: 'm10_acceptance_run_1',
      evidenceRefIds: step.evidenceRefIds,
      auditEventIds: step.auditEventIds,
      evidenceCount: 1,
      auditEventCount: 1,
      evidenceBundleHash: 'm10:bundle',
      governanceProjectionHash: 'm10:governance',
      telemetryProjectionHash: 'm10:telemetry',
      evidenceAuditAuthoritative: true,
      telemetryAuthoritative: false,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'M10 acceptance evidence summary stores ids and hashes only.',
    });
    const run = M10PilotAcceptanceRehearsalRunSchema.parse({
      id: 'm10_acceptance_run_1',
      schemaVersion,
      createdAt,
      status: 'passed',
      scenario: 'all-pass',
      checklistId: 'm10_pilot_checklist_1',
      approvalHistoryProjectionId: 'approval_decision_history_projection_1',
      governanceProjectionHash: 'm10:governance',
      goldenPathRunId: 'golden_path_rehearsal_1',
      goldenPathStatus: 'passed',
      prActionStatus: 'not_ready_no_live_pr',
      steps: [step],
      evidenceSummary,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      evidenceAuditAuthoritative: true,
      telemetryAuthoritative: false,
      summary: 'M10 acceptance rehearsal passed without live execution.',
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('passed');
    expect(run.prActionStatus).toBe('not_ready_no_live_pr');
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(() =>
      M10PilotAcceptanceRehearsalRunSchema.parse({
        ...run,
        id: 'm10_acceptance_run_bad_token',
        localControlKeyRead: true,
      }),
    ).toThrow();
    expect(() =>
      M10PilotAcceptanceStepSchema.parse({
        ...step,
        id: 'm10_acceptance_step_bad_metadata',
        metadata: { requestBody: 'raw body' },
      }),
    ).toThrow();
  });

  it('parses M9 pilot contracts as metadata-only', () => {
    const step = M9PilotStepSchema.parse({
      id: 'm9_pilot_step_1',
      schemaVersion,
      createdAt,
      phase: 'codex',
      status: 'completed',
      order: 2,
      evidenceRefIds: ['evidence_codex_1'],
      auditEventIds: ['audit_codex_1'],
      boundaryInvoked: true,
      externalProcessStarted: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Codex read-only dry-run completed with metadata only.',
    });
    const readiness = M9PilotReadinessSchema.parse({
      id: 'm9_pilot_readiness_1',
      schemaVersion,
      createdAt,
      status: 'ready',
      checkCount: 8,
      passedCheckCount: 8,
      blockerCount: 0,
      blockers: [],
      worktreeManagerEnabled: true,
      codexDryRunOnly: true,
      nxVerificationPlanned: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M9 pilot readiness is ready.',
    });
    const evidenceSummary = M9PilotEvidenceSummarySchema.parse({
      id: 'm9_pilot_evidence_summary_1',
      schemaVersion,
      createdAt,
      runId: 'm9_pilot_run_1',
      evidenceRefIds: ['evidence_codex_1'],
      auditEventIds: ['audit_codex_1'],
      evidenceCount: 1,
      auditEventCount: 1,
      bundleHash: 'sha256:m9-bundle',
      rawPathStored: false,
      bodyStored: false,
      summary: 'M9 pilot evidence summary stores ids and hashes only.',
    });
    const run = M9PilotRunSchema.parse({
      id: 'm9_pilot_run_1',
      schemaVersion,
      createdAt,
      status: 'passed',
      requestTitleHash: 'sha256:title',
      requestDescriptionHash: 'sha256:description',
      readiness,
      steps: [step],
      evidenceSummary,
      worktreeRunId: 'worktree_run_1',
      codexStatus: 'passed',
      verificationStatus: 'passed',
      prDraftStatus: 'blocked_no_patch',
      changedFileCount: 0,
      cleanupRequired: true,
      gitProcessBoundaryInvoked: true,
      codexProcessBoundaryInvoked: true,
      nxProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      codexNoRealWrite: true,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M9 pilot passed while PR draft remains blocked because no patch exists.',
    });

    const serialized = JSON.stringify(run);
    expect(run.prDraftStatus).toBe('blocked_no_patch');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('raw prompt body');
    expect(() =>
      M9PilotRunSchema.parse({
        ...run,
        id: 'm9_pilot_run_bad_patch',
        changedFileCount: 1,
      }),
    ).toThrow();
    expect(() =>
      M9PilotRunSchema.parse({
        ...run,
        id: 'm9_pilot_run_bad_metadata',
        metadata: { prompt: 'raw prompt body' },
      }),
    ).toThrow();
  });

  it('parses M11 narrow-path pilot contracts as metadata-only', () => {
    const step = M11PilotStepSchema.parse({
      id: 'm11_pilot_step_codex_1',
      schemaVersion,
      createdAt,
      phase: 'codex',
      status: 'completed',
      order: 2,
      evidenceRefIds: ['evidence_codex_1'],
      auditEventIds: ['audit_codex_1'],
      boundaryInvoked: true,
      externalProcessStarted: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Codex read-only dry-run completed without patch generation.',
    });
    const readiness = M11PilotReadinessSchema.parse({
      id: 'm11_pilot_readiness_1',
      schemaVersion,
      createdAt,
      status: 'ready',
      checkCount: 8,
      passedCheckCount: 8,
      blockerCount: 0,
      blockers: [],
      worktreeManagerEnabled: true,
      codexReadOnlyDryRunOnly: true,
      nxVerificationPlanned: true,
      localControlRequired: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 pilot readiness is ready.',
    });
    const evidenceSummary = M11PilotEvidenceSummarySchema.parse({
      id: 'm11_pilot_evidence_summary_1',
      schemaVersion,
      createdAt,
      runId: 'm11_pilot_run_1',
      evidenceRefIds: ['evidence_codex_1'],
      auditEventIds: ['audit_codex_1'],
      evidenceCount: 1,
      auditEventCount: 1,
      bundleHash: 'sha256:m11-bundle',
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 pilot evidence summary stores ids and hashes only.',
    });
    const failureSummary = M11PilotFailureSummarySchema.parse({
      id: 'm11_pilot_failure_summary_1',
      schemaVersion,
      createdAt,
      runId: 'm11_pilot_run_1',
      classification: 'none',
      blockerCount: 0,
      blockers: [],
      cleanupRequired: true,
      boundaryReached: true,
      approvalConsumed: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 pilot has no failure.',
    });
    expect(M11PilotRecoveryActionSchema.options).toContain('review_cleanup_handoff');
    expect(M11PilotCleanupApprovalStatusSchema.options).toContain('not_requested');
    const cleanupHandoff = M11PilotCleanupHandoffSchema.parse({
      id: 'm11_pilot_cleanup_handoff_1',
      schemaVersion,
      createdAt,
      runId: 'm11_pilot_run_1',
      worktreeRunId: 'worktree_run_1',
      cleanupRequired: true,
      cleanupDeferred: true,
      cleanupCompleted: false,
      cleanupDryRunId: 'worktree_cleanup_dry_run_1',
      cleanupApprovalStatus: 'requested',
      cleanupBlockers: ['cleanup_approval_pending'],
      cleanupEvidenceRefIds: ['evidence_cleanup_1'],
      cleanupAuditEventIds: ['audit_cleanup_1'],
      cleanupEvidenceCount: 1,
      cleanupAuditEventCount: 1,
      worktreePathHash: 'sha256:worktree-path',
      gitProcessBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 cleanup handoff records only ids and hashes.',
    });
    const recovery = M11PilotRecoveryProjectionSchema.parse({
      id: 'm11_pilot_recovery_projection_1',
      schemaVersion,
      createdAt,
      runId: 'm11_pilot_run_1',
      status: 'passed',
      failureClassification: 'none',
      recoveryAction: 'review_cleanup_handoff',
      cleanupHandoff,
      evidenceRefIds: ['evidence_codex_1'],
      auditEventIds: ['audit_codex_1'],
      evidenceCount: 1,
      auditEventCount: 1,
      boundaryReached: true,
      approvalConsumed: true,
      gitProcessBoundaryInvoked: true,
      codexProcessBoundaryInvoked: true,
      nxProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      localControlRequired: true,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 recovery projection points at cleanup handoff metadata.',
    });
    const run = M11PilotRunSchema.parse({
      id: 'm11_pilot_run_1',
      schemaVersion,
      createdAt,
      status: 'passed',
      requestTitleHash: 'sha256:title',
      requestDescriptionHash: 'sha256:description',
      readiness,
      steps: [step],
      evidenceSummary,
      failureSummary,
      worktreeRunId: 'worktree_run_1',
      codexStatus: 'passed',
      verificationStatus: 'passed',
      prDraftStatus: 'not_ready_no_patch',
      changedFileCount: 0,
      cleanupRequired: true,
      gitProcessBoundaryInvoked: true,
      codexProcessBoundaryInvoked: true,
      nxProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      codexNoRealWrite: true,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 pilot passed while PR draft remains not ready because no patch exists.',
    });

    const serialized = JSON.stringify(run);
    const recoverySerialized = JSON.stringify(recovery);
    expect(run.prDraftStatus).toBe('not_ready_no_patch');
    expect(recovery.recoveryAction).toBe('review_cleanup_handoff');
    expect(recovery.cleanupHandoff.cleanupApprovalStatus).toBe('requested');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('raw prompt body');
    expect(recoverySerialized).not.toContain('diff --git');
    expect(recoverySerialized).not.toContain('C:/');
    expect(recoverySerialized).not.toContain('stdout');
    expect(recoverySerialized).not.toContain('stderr');
    expect(recoverySerialized).not.toContain('raw prompt body');
    expect(() =>
      M11PilotRunSchema.parse({
        ...run,
        id: 'm11_pilot_run_bad_patch',
        changedFileCount: 1,
      }),
    ).toThrow();
    expect(() =>
      M11PilotRunSchema.parse({
        ...run,
        id: 'm11_pilot_run_bad_metadata',
        metadata: { localControlKey: 'secret', prompt: 'raw prompt body' },
      }),
    ).toThrow();
    expect(() =>
      M11PilotRecoveryProjectionSchema.parse({
        ...recovery,
        id: 'm11_pilot_recovery_bad_metadata',
        metadata: { path: 'C:/repo/worktree', diff: 'diff --git' },
      }),
    ).toThrow();
  });

  it('parses M11 acceptance smoke contracts as fixture-only metadata', () => {
    expect(M11PilotAcceptanceScenarioSchema.options).toEqual([
      'all-pass',
      'readiness-blocked',
      'worktree-approval-blocked',
      'worktree-boundary-failed',
      'codex-failed',
      'nx-failed',
    ]);

    const step = M11PilotAcceptanceSmokeStepSchema.parse({
      id: 'm11_pilot_acceptance_smoke_step_1',
      schemaVersion,
      createdAt,
      scenario: 'all-pass',
      phase: 'codex',
      status: 'passed',
      order: 2,
      evidenceRefIds: ['m11_smoke_evidence_1'],
      auditEventIds: ['m11_smoke_audit_1'],
      boundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 smoke fixture marks Codex dry-run stage passed without execution.',
    });
    const run = M11PilotAcceptanceSmokeRunSchema.parse({
      id: 'm11_pilot_acceptance_smoke_run_1',
      schemaVersion,
      createdAt,
      scenario: 'all-pass',
      status: 'passed',
      steps: [step],
      failureClassification: 'none',
      recoveryAction: 'review_cleanup_handoff',
      prDraftStatus: 'not_ready_no_patch',
      cleanupRequired: true,
      evidenceRefIds: ['m11_smoke_evidence_1'],
      auditEventIds: ['m11_smoke_audit_1'],
      evidenceCount: 1,
      auditEventCount: 1,
      fixtureOnly: true,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'M11 acceptance smoke passed using fixture-only metadata.',
    });
    const failed = M11PilotAcceptanceSmokeRunSchema.parse({
      ...run,
      id: 'm11_pilot_acceptance_smoke_run_failed',
      scenario: 'nx-failed',
      status: 'failed',
      failureClassification: 'nx_failed',
      recoveryAction: 'review_nx_verification',
      prDraftStatus: 'blocked',
      summary: 'M11 acceptance smoke failed at Nx fixture stage.',
    });
    const serialized = JSON.stringify({ run, failed });

    expect(run.status).toBe('passed');
    expect(run.fixtureOnly).toBe(true);
    expect(run.prDraftStatus).toBe('not_ready_no_patch');
    expect(failed.status).toBe('failed');
    expect(failed.prDraftStatus).toBe('blocked');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('raw prompt body');
    expect(() =>
      M11PilotAcceptanceSmokeRunSchema.parse({
        ...run,
        id: 'm11_pilot_acceptance_smoke_bad_pr',
        prDraftStatus: 'blocked',
      }),
    ).toThrow();
    expect(() =>
      M11PilotAcceptanceSmokeStepSchema.parse({
        ...step,
        id: 'm11_pilot_acceptance_smoke_bad_metadata',
        metadata: { prompt: 'raw prompt body', path: 'C:/repo' },
      }),
    ).toThrow();
    expect(() =>
      M11PilotAcceptanceSmokeRunSchema.parse({
        ...run,
        id: 'm11_pilot_acceptance_smoke_bad_metadata',
        metadata: { diff: 'diff --git', localControlKey: 'secret' },
      }),
    ).toThrow();
  });

  it('parses approval UX inbox and decision contracts as metadata-only', () => {
    expect(ApprovalUxTypeSchema.options).toContain('m9_pilot');
    expect(ApprovalUxDecisionSchema.options).toEqual(['approved', 'denied', 'revoked']);

    const item = ApprovalInboxItemSchema.parse({
      id: 'approval_inbox_item_1',
      schemaVersion,
      createdAt,
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      approvalRecordId: 'worktree_approval_record_1',
      approvalArtifactIdHash: 'sha256:artifact',
      status: 'requested',
      dryRunIdHash: 'sha256:dry-run',
      targetHash: 'sha256:target',
      riskLevel: 'high',
      actionMode: 'write',
      policyDecisionId: 'policy_1',
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      canApprove: true,
      canDeny: true,
      canRevoke: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Worktree approval request is ready for operator decision.',
    });
    const projection = ApprovalInboxProjectionSchema.parse({
      id: 'approval_inbox_projection_1',
      schemaVersion,
      createdAt,
      items: [item],
      itemCount: 1,
      requestedCount: 1,
      approvedCount: 0,
      terminalCount: 0,
      typeBreakdown: { worktree: 1 },
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval inbox has one metadata-only item.',
    });
    const decisionRequest = ApprovalDecisionRequestSchema.parse({
      approvalRequestId: 'worktree_approval_request_1',
      approvalType: 'worktree',
      decision: 'approved',
      reason: 'Reviewed evidence bundle',
    });
    const decisionResult = ApprovalDecisionResultSchema.parse({
      id: 'approval_decision_result_1',
      schemaVersion,
      createdAt,
      approvalRequestId: decisionRequest.approvalRequestId,
      approvalType: decisionRequest.approvalType,
      decision: decisionRequest.decision,
      status: 'approved',
      approved: true,
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval decision recorded through Supervisor.',
    });

    const serialized = JSON.stringify({ projection, decisionResult });
    expect(projection.itemCount).toBe(1);
    expect(decisionResult.approved).toBe(true);
    expect(serialized).not.toContain('approval-token');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('raw prompt');
    expect(() =>
      ApprovalDecisionRequestSchema.parse({
        ...decisionRequest,
        approvalArtifact: { id: 'untrusted' },
      }),
    ).toThrow();
    expect(() =>
      ApprovalInboxItemSchema.parse({
        ...item,
        id: 'approval_inbox_item_bad_metadata',
        metadata: { executionAuthority: { allowed: true } },
      }),
    ).toThrow();
  });

  it('parses approval decision history projections as metadata-only', () => {
    const historyItem = ApprovalDecisionHistoryItemSchema.parse({
      id: 'approval_decision_history_item_1',
      schemaVersion,
      createdAt,
      source: 'decision_result',
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      approvalDecisionResultId: 'approval_decision_result_1',
      decision: 'approved',
      status: 'approved',
      targetHash: 'sha256:target',
      reasonHash: 'sha256:reason',
      reasonSummary: 'Operator reason stored as hash-only summary.',
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval decision history item stores metadata only.',
    });
    const historySummary = ApprovalDecisionHistorySummarySchema.parse({
      id: 'approval_decision_history_summary_1',
      schemaVersion,
      createdAt,
      projectionId: 'approval_decision_history_projection_1',
      itemCount: 1,
      requestedCount: 0,
      approvedCount: 1,
      deniedCount: 0,
      revokedCount: 0,
      terminalCount: 0,
      typeBreakdown: { worktree: 1 },
      statusBreakdown: { approved: 1 },
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval decision history summary stores counts only.',
    });
    const projection = ApprovalDecisionHistoryProjectionSchema.parse({
      id: 'approval_decision_history_projection_1',
      schemaVersion,
      createdAt,
      items: [historyItem],
      itemCount: 1,
      requestedCount: 0,
      approvedCount: 1,
      deniedCount: 0,
      revokedCount: 0,
      terminalCount: 0,
      typeBreakdown: { worktree: 1 },
      statusBreakdown: { approved: 1 },
      decisionBreakdown: { approved: 1 },
      summaryProjection: historySummary,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval decision history has one metadata-only item.',
    });
    const serialized = JSON.stringify(projection);

    expect(projection.itemCount).toBe(1);
    expect(serialized).not.toContain('approval-token');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('Reviewed raw private reason');
    expect(() =>
      ApprovalDecisionHistoryItemSchema.parse({
        ...historyItem,
        id: 'approval_decision_history_item_bad_reason',
        reason: 'Reviewed raw private reason',
      }),
    ).toThrow();
    expect(() =>
      ApprovalDecisionHistoryProjectionSchema.parse({
        ...projection,
        id: 'approval_decision_history_projection_bad_metadata',
        metadata: { token: 'approval-token' },
      }),
    ).toThrow();
  });

  it('rejects M10 hardening raw metadata across operator and approval projections', () => {
    const forbiddenMetadata = {
      raw: {
        reason: 'raw operator reason',
        prompt: 'raw prompt',
        stdout: 'stdout body',
        stderr: 'stderr body',
        diff: 'diff --git',
        path: 'C:/private/worktree',
        body: 'raw body',
        token: 'approval-token',
        cookie: 'approval-cookie',
        session: 'approval-session',
        localControlKey: 'local-control-secret',
      },
    };
    const operatorStep = {
      id: 'm10_operator_step_hardening',
      schemaVersion,
      createdAt,
      code: 'doctor_preflight',
      label: 'Doctor preflight',
      phase: 'preflight',
      status: 'blocked',
      required: true,
      blockerCount: 1,
      blockers: ['integration_disabled'],
      safeEnableNotes: ['Review operator checklist.'],
      evidenceRefIds: [],
      auditEventIds: [],
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'Operator step stores metadata only.',
    };
    const acceptanceStep = {
      id: 'm10_acceptance_step_hardening',
      schemaVersion,
      createdAt,
      code: 'doctor_preflight',
      phase: 'doctor',
      status: 'passed',
      order: 0,
      evidenceRefIds: [],
      auditEventIds: [],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'Acceptance step stores metadata only.',
    };
    const historyItem = {
      id: 'approval_decision_history_item_hardening',
      schemaVersion,
      createdAt,
      source: 'decision_result',
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      approvalDecisionResultId: 'approval_decision_result_1',
      decision: 'denied',
      status: 'denied',
      targetHash: 'sha256:target',
      reasonHash: 'sha256:reason',
      reasonSummary: 'Operator reason stored as hash-only summary.',
      evidenceRefIds: [],
      auditEventIds: [],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      tokenStored: false,
      summary: 'Approval decision history item stores metadata only.',
    };

    expect(() => M10PilotOperatorStepSchema.parse({ ...operatorStep, metadata: forbiddenMetadata }))
      .toThrow();
    expect(() => M10PilotChecklistSchema.parse({
      id: 'm10_pilot_checklist_hardening',
      schemaVersion,
      createdAt,
      status: 'blocked',
      steps: [operatorStep],
      readyStepCount: 0,
      blockedStepCount: 1,
      reviewStepCount: 0,
      requiredStepCount: 1,
      blockerCount: 1,
      integrationCount: 8,
      configuredLocalControlKeyCount: 0,
      governanceRunCount: 0,
      approvalInboxItemCount: 0,
      rawValueStored: false,
      rawPathStored: false,
      bodyStored: false,
      localControlKeyRead: false,
      supervisorPostAllowed: false,
      adapterExecuteAllowed: false,
      summary: 'Checklist stores metadata only.',
      metadata: forbiddenMetadata,
    })).toThrow();
    expect(() => M10PilotAcceptanceStepSchema.parse({ ...acceptanceStep, metadata: forbiddenMetadata }))
      .toThrow();
    expect(() =>
      M10PilotAcceptanceRehearsalRunSchema.parse({
        id: 'm10_acceptance_run_hardening',
        schemaVersion,
        createdAt,
        status: 'passed',
        scenario: 'all-pass',
        checklistId: 'm10_pilot_checklist_1',
        approvalHistoryProjectionId: 'approval_decision_history_projection_1',
        governanceProjectionHash: 'm10:governance',
        goldenPathRunId: 'golden_path_1',
        goldenPathStatus: 'passed',
        prActionStatus: 'not_ready_no_live_pr',
        steps: [acceptanceStep],
        evidenceSummary: {
          id: 'm10_acceptance_evidence_summary_hardening',
          schemaVersion,
          createdAt,
          rehearsalRunId: 'm10_acceptance_run_hardening',
          evidenceRefIds: [],
          auditEventIds: [],
          evidenceCount: 0,
          auditEventCount: 0,
          evidenceBundleHash: 'm10:bundle',
          governanceProjectionHash: 'm10:governance',
          telemetryProjectionHash: 'm10:telemetry',
          evidenceAuditAuthoritative: true,
          telemetryAuthoritative: false,
          rawPathStored: false,
          bodyStored: false,
          tokenStored: false,
          summary: 'Evidence summary stores metadata only.',
        },
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        networkBoundaryInvoked: false,
        noRealWrite: true,
        rawPathStored: false,
        bodyStored: false,
        tokenStored: false,
        localControlKeyRead: false,
        supervisorPostAllowed: false,
        adapterExecuteAllowed: false,
        pushAllowed: false,
        pullRequestOpened: false,
        evidenceAuditAuthoritative: true,
        telemetryAuthoritative: false,
        summary: 'Acceptance run stores metadata only.',
        metadata: forbiddenMetadata,
      }),
    ).toThrow();
    expect(() => ApprovalDecisionHistoryItemSchema.parse({ ...historyItem, metadata: forbiddenMetadata }))
      .toThrow();
  });

  it('parses verification adapter contract models', () => {
    expect(VerificationTargetSchema.options).toEqual(['lint', 'test', 'build']);
    expect(() => VerificationTargetSchema.parse('release')).toThrow();

    const affectedProject = AffectedProjectSchema.parse({
      id: 'affected_project_1',
      schemaVersion,
      createdAt,
      name: 'contracts',
      nameHash: 'sha256:contracts',
    });

    const plan = VerificationPlanSchema.parse({
      id: 'verification_plan_1',
      schemaVersion,
      createdAt,
      adapterName: 'nx-affected',
      cwdHash: 'sha256:cwd',
      targets: ['lint', 'test'],
      baseRef: 'HEAD~1',
      headRef: 'HEAD',
      affectedProjects: [affectedProject],
      commandHash: 'sha256:command',
      processBoundaryPlanned: true,
      noRealWrite: true,
      bodyStored: false,
      summary: 'Verify affected projects.',
    });

    const commandResult = VerificationCommandResultSchema.parse({
      id: 'verification_command_1',
      schemaVersion,
      createdAt,
      commandKind: 'verification',
      targets: ['lint', 'test'],
      status: 'completed',
      exitCode: 0,
      stdoutHash: 'sha256:stdout',
      stderrHash: 'sha256:stderr',
      stdoutLineCount: 3,
      stderrLineCount: 0,
      outputBodyStored: false,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'Verification passed.',
    });

    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_verification_1',
      schemaVersion,
      createdAt,
      kind: 'verification.run_summary',
      hash: 'sha256:verification',
    });

    const run = VerificationRunSchema.parse({
      id: 'verification_run_1',
      schemaVersion,
      createdAt,
      targetId: 'nx-affected',
      status: 'passed',
      checks: ['lint', 'test'],
      evidenceRefs: [evidence],
      planId: plan.id,
      affectedProjects: [affectedProject],
      commandResults: [commandResult],
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      noRealWrite: true,
      auditEventIds: ['audit_1'],
      summary: 'Verification run passed.',
    });

    expect(plan.targets).toEqual(['lint', 'test']);
    expect(run.status).toBe('passed');
    expect(run.commandResults?.[0]?.outputBodyStored).toBe(false);
  });

  it('parses minimal orchestration run contract models without raw bodies', () => {
    expect(OrchestrationRunStatusSchema.options).toEqual([
      'planned',
      'running',
      'passed',
      'failed',
      'blocked',
      'aborted',
    ]);

    const event = OrchestrationTimelineEventSchema.parse({
      id: 'orchestration_timeline_event_1',
      schemaVersion,
      createdAt,
      runId: 'orchestration_run_1',
      phase: 'codex',
      status: 'passed',
      summary: 'Codex adapter completed from governed input.',
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
    });
    const run = OrchestrationRunSchema.parse({
      id: 'orchestration_run_1',
      schemaVersion,
      createdAt,
      requestId: 'development_request_1',
      orchestrationPlanId: 'orchestration_plan_1',
      status: 'passed',
      codexRun: {
        adapterName: 'codex-cli',
        status: 'passed',
        capabilityResultId: 'capability_result_codex',
        processBoundaryInvoked: true,
        externalProcessStarted: true,
        noRealWrite: true,
        evidenceRefIds: ['evidence_1'],
        auditEventIds: ['audit_1'],
        summary: 'Codex CLI adapter completed.',
      },
      verificationRun: {
        adapterName: 'nx-affected',
        status: 'passed',
        capabilityResultId: 'capability_result_nx',
        processBoundaryInvoked: true,
        externalProcessStarted: true,
        noRealWrite: true,
        evidenceRefIds: ['evidence_2'],
        auditEventIds: ['audit_2'],
        summary: 'Nx verification passed.',
      },
      timeline: [event],
      evidenceRefIds: ['evidence_1', 'evidence_2'],
      auditEventIds: ['audit_1', 'audit_2'],
      policyDecisionIds: ['policy_1', 'policy_2'],
      summary: {
        requestTitle: 'Minimal governed orchestration',
        status: 'passed',
        codexStatus: 'passed',
        verificationStatus: 'passed',
        affectedProjectCount: 2,
        commandResultCount: 2,
        evidenceCount: 2,
        auditEventCount: 2,
        policyDecisionCount: 2,
        processBoundaryInvoked: true,
        externalProcessStarted: true,
        noRealWrite: true,
        bodyStored: false,
        rawPathStored: false,
      },
    });

    expect(run.timeline[0]?.phase).toBe('codex');
    expect(JSON.stringify(run)).not.toContain('stdout body');
    expect(JSON.stringify(run)).not.toContain('C:\\Users\\Thomas');
  });

  it('parses skill resolution contract models', () => {
    const result = SkillResolutionResultSchema.parse({
      id: 'skill_resolution_1',
      schemaVersion,
      createdAt,
      inputSummary: 'mock resolution',
      selectedSkills: [
        {
          skillId: 'codexhub-architecture-planner',
          score: 90,
          matchedKeywords: ['architecture'],
          reason: 'Required capability architecture.planning matched.',
          required: true,
          skill: {
            id: 'codexhub-architecture-planner',
            displayName: 'Architecture Planner',
            description: 'Mock descriptor',
            capabilities: [
              {
                id: 'architecture.planning',
                description: 'Plan architecture',
                riskLevel: 'low',
                readOnlyDefault: true,
              },
            ],
            triggers: [
              {
                id: 'architecture.trigger',
                keywords: ['architecture'],
                capabilityIds: ['architecture.planning'],
              },
            ],
          },
        },
      ],
    });

    expect(result.selectedSkills[0]?.skillId).toBe('codexhub-architecture-planner');
  });

  it('parses codex exec replay contract models', () => {
    const result = CodexExecReplayResultSchema.parse({
      id: 'codex_replay_1',
      schemaVersion,
      createdAt,
      threadId: 'thread_fixture_1',
      events: [
        {
          id: 'codex_event_1',
          schemaVersion,
          createdAt,
          rawEventType: 'thread.started',
          normalizedType: 'thread.started',
          threadId: 'thread_fixture_1',
          summary: 'Thread started',
          payloadHash: 'sha256:event',
          payloadLength: 42,
          safe: true,
        },
      ],
      eventCount: 1,
      itemCount: 0,
      commandExecutionCount: 0,
      fileChangeCount: 0,
      mcpToolCallCount: 0,
      webSearchCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      evidenceRefs: [
        {
          id: 'evidence_codex_1',
          schemaVersion,
          createdAt,
          kind: 'codex.exec.jsonl.replay',
          hash: 'sha256:replay',
          summary: 'Codex fixture replay summary',
        },
      ],
      auditEvents: [
        {
          id: 'audit_codex_1',
          schemaVersion,
          createdAt,
          actor: 'codex-kernel.fixture-replay',
          action: 'codex.exec.fixture_replay.completed',
          outcome: 'completed',
          evidenceRefs: [],
        },
      ],
    });

    expect(result.finalStatus).toBe('completed');
    expect(result.evidenceRefs[0]?.kind).toBe('codex.exec.jsonl.replay');
  });

  it('parses codex replay storage records without jsonl body', () => {
    const record = CodexReplayRecordSchema.parse({
      id: 'codex_replay_1',
      schemaVersion,
      createdAt,
      sourceKind: 'fixture',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      threadId: 'thread_fixture_1',
      status: 'completed',
      summary: 'Fixture replay completed: 1 events, 0 errors',
      replayHash: 'sha256:replay',
      eventCount: 1,
      itemCount: 0,
      commandExecutionCount: 0,
      fileChangeCount: 0,
      mcpToolCallCount: 0,
      webSearchCount: 0,
      errorCount: 0,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      evidenceRefs: [],
      auditEventIds: ['audit_codex_1'],
      storageMetadata: {
        sourceKind: 'fixture',
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixturePathHash: 'sha256:path',
        replayHash: 'sha256:replay',
        bodyStored: false,
        normalizedEventsStored: false,
        eventHashCount: 1,
        mockOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    expect(record.sourceKind).toBe('fixture');
    expect(JSON.stringify(record)).not.toContain('thread.started');
  });

  it('parses codex live control-plane records without prompt body', () => {
    const intent = {
      id: 'codex_intent_1',
      schemaVersion,
      createdAt,
      title: 'Summarize repository structure',
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      promptSummary: 'Summarize repository structure',
      promptHash: 'sha256:prompt',
      promptLength: 30,
      promptBodyStored: false,
      liveAdapterEnabled: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const dryRunPlan = {
      id: 'codex_dry_run_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      intent,
      title: intent.title,
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      riskLevel: 'medium',
      promptSummary: intent.promptSummary,
      promptHash: intent.promptHash,
      promptLength: intent.promptLength,
      promptBodyStored: false,
      liveAdapterEnabled: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      summary: 'Dry-run control plan',
    };
    const policyDecision = {
      id: 'policy_1',
      schemaVersion,
      createdAt,
      actionId: dryRunPlan.id,
      actionType: 'codex.exec.live.intent',
      actionMode: 'read',
      riskLevel: 'medium',
      outcome: 'deny',
      reasons: ['disabled'],
      requiresDryRun: true,
      requiresApproval: true,
    };
    const record = CodexExecLiveRunRecordSchema.parse({
      id: 'codex_live_run_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      dryRunPlanId: dryRunPlan.id,
      title: intent.title,
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      riskLevel: 'medium',
      status: 'blocked',
      intent,
      dryRunPlan,
      commandPreview: {
        id: 'codex_preview_1',
        schemaVersion,
        createdAt,
        intentId: intent.id,
        dryRunPlanId: dryRunPlan.id,
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
        previewSummary: 'Disabled preview',
        binaryName: 'codex',
        argumentSummary: 'summarized arguments only',
        previewHash: 'sha256:preview',
        redacted: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      policyDecision,
      approvalRequirement: {
        id: 'codex_approval_1',
        schemaVersion,
        createdAt,
        dryRunPlanId: dryRunPlan.id,
        policyDecisionId: policyDecision.id,
        required: true,
        riskLevel: 'medium',
        approvalMode: 'required',
        status: 'blocked',
        reason: 'approval required',
      },
      disabledError: {
        id: 'codex_disabled_error_1',
        schemaVersion,
        createdAt,
        code: 'CODEX_EXEC_LIVE_DISABLED',
        message: 'Live adapter disabled',
        reason: 'control-plane only',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      evidenceRefs: [],
      auditEvents: [],
      promptSummary: intent.promptSummary,
      promptHash: intent.promptHash,
      promptLength: intent.promptLength,
      promptBodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(record.liveExecution).toBe(false);
    expect(record.externalProcessStarted).toBe(false);
    expect(record.promptBodyStored).toBe(false);
    expect(JSON.stringify(record)).not.toContain('list risk areas');
  });

  it('parses codex live config and preflight models', () => {
    const config = CodexExecLiveConfigSchema.parse({
      id: 'codex_live_config_1',
      schemaVersion,
      createdAt,
    });
    const preflight = CodexExecPreflightResultSchema.parse({
      id: 'codex_preflight_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      configId: config.id,
      status: 'blocked',
      checks: [
        {
          id: 'codex_preflight_check_1',
          schemaVersion,
          createdAt,
          name: 'live-config',
          status: 'failed',
          summary: 'disabled by config',
        },
      ],
      worktreeRequirement: {
        id: 'codex_worktree_requirement_1',
        schemaVersion,
        createdAt,
        sandboxMode: 'read_only',
        requirement: {
          requiresIsolatedWorktree: false,
          isolatedWorktreePresent: false,
        },
        status: 'not_required',
        summary: 'not required',
      },
      summary: 'blocked',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(config.liveEnabled).toBe(false);
    expect(config.allowedSandboxModes).toEqual(['read_only']);
    expect(config.forbiddenSandboxModes).toEqual(['workspace_write', 'danger_full_access']);
    expect(config.liveExecution).toBe(false);
    expect(config.executionDisabled).toBe(true);
    expect(preflight.status).toBe('blocked');
  });

  it('parses real read-only adapter process-start state as authoritative metadata', () => {
    const realBoundaryFlags = {
      liveExecution: false,
      externalProcessStarted: true,
      executionDisabled: true,
      processAdapterStarted: true,
      processAdapterApproved: false,
      implementationApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const evidenceSummary = CodexExecRealReadOnlyAdapterEvidenceSummarySchema.parse({
      id: 'codex_real_read_only_adapter_evidence_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      requestId: 'codex_real_read_only_adapter_request_1',
      resultId: 'codex_real_read_only_adapter_result_1',
      evidenceRefIds: ['evidence_1'],
      eventHashCount: 2,
      outputHashCount: 2,
      metadataHash: 'sha256:evidence',
      redacted: true,
      summary: 'Metadata-only evidence summary.',
      ...realBoundaryFlags,
    });
    const auditSummary = CodexExecRealReadOnlyAdapterAuditSummarySchema.parse({
      id: 'codex_real_read_only_adapter_audit_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      requestId: 'codex_real_read_only_adapter_request_1',
      resultId: 'codex_real_read_only_adapter_result_1',
      auditEventIds: ['audit_1'],
      beforeStartRequired: true,
      afterFinishRequired: true,
      abortRequired: true,
      failureRequired: true,
      eventCount: 1,
      summary: 'Metadata-only audit summary.',
      ...realBoundaryFlags,
    });
    const result = CodexExecRealReadOnlyAdapterResultSchema.parse({
      id: 'codex_real_read_only_adapter_result_1',
      schemaVersion,
      createdAt,
      requestId: 'codex_real_read_only_adapter_request_1',
      dryRunId: 'codex_dry_run_1',
      preflightId: 'codex_real_read_only_adapter_preflight_1',
      status: 'completed',
      evidenceSummary,
      auditSummary,
      postRunVerificationRequired: true,
      workspaceMutationAllowed: false,
      unexpectedWorkspaceDiffCritical: true,
      autoRevertAllowed: false,
      summary: 'Boundary completed with metadata-only process state.',
      ...realBoundaryFlags,
    });
    const noLiveEvidence = CodexExecNoLiveEvidenceSummarySchema.parse({
      id: 'codex_no_live_evidence_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      noRealCodexExec: true,
      noExternalProcessStarted: false,
      noBrowserOrCdpAction: true,
      noWorkspaceWrite: true,
      noExecutionApprovalGranted: true,
      evidenceRefCount: 1,
      auditEventCount: 1,
      evidenceKinds: ['codex.exec.real_read_only_adapter.attempt'],
      auditActions: ['codex.exec.real_read_only_adapter.complete'],
      summary: 'Boundary was invoked through the real read-only adapter path.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(result.externalProcessStarted).toBe(true);
    expect(result.processAdapterStarted).toBe(true);
    expect(result.evidenceSummary?.externalProcessStarted).toBe(true);
    expect(result.auditSummary?.externalProcessStarted).toBe(true);
    expect(noLiveEvidence.noExternalProcessStarted).toBe(false);
  });

  it('parses codex config load and manual approval records', () => {
    const config = CodexExecLiveConfigSchema.parse({
      id: 'codex_live_config_1',
      schemaVersion,
      createdAt,
      configSource: 'file',
      configPath: '.codexhub/codex-exec.yaml',
      configPathHash: 'sha256:path',
    });
    const configLoad = CodexExecConfigLoadResultSchema.parse({
      id: 'codex_config_load_1',
      schemaVersion,
      createdAt,
      source: 'file',
      status: 'loaded',
      config,
      configFile: {
        id: 'codex_config_file_1',
        schemaVersion,
        createdAt,
        configPath: '.codexhub/codex-exec.yaml',
        configPathHash: 'sha256:path',
        configHash: 'sha256:config',
        bodyStored: false,
        summary: 'Loaded disabled config file',
      },
      summary: 'Loaded config',
    });
    const approvalRecord = CodexExecManualApprovalRecordSchema.parse({
      id: 'codex_approval_record_1',
      schemaVersion,
      createdAt,
      request: {
        id: 'codex_approval_request_1',
        schemaVersion,
        createdAt,
        dryRunPlanId: 'codex_dry_run_1',
        dryRunPlanHash: 'sha256:dry-run',
        policyDecisionId: 'policy_1',
        policyDecisionHash: 'sha256:policy',
        scope: 'read_only_plan',
        status: 'pending',
        riskLevel: 'medium',
        requestedBy: 'local-human',
        reason: 'Review disabled control-plane run',
        expiresAt: '2026-04-28T01:00:00.000Z',
        singleUse: true,
        summary: 'Approval requested',
      },
      decision: {
        id: 'codex_approval_decision_1',
        schemaVersion,
        createdAt,
        approvalRequestId: 'codex_approval_request_1',
        dryRunPlanId: 'codex_dry_run_1',
        policyDecisionId: 'policy_1',
        outcome: 'approved',
        decidedBy: 'local-human',
        reasonSummary: 'Approved for disabled gate evaluation',
        decisionHash: 'sha256:decision',
        approved: true,
        summary: 'Approval approved',
      },
      status: 'approved',
      evidenceRefs: [],
      auditEventIds: [],
      summary: 'Manual approval record',
    });

    expect(configLoad.config.configSource).toBe('file');
    expect(configLoad.configFile?.bodyStored).toBe(false);
    expect(approvalRecord.decision?.approved).toBe(true);
    expect(approvalRecord.liveExecution).toBe(false);
  });

  it('parses codex manual approval state and transition results', () => {
    const approvalState = CodexExecManualApprovalStateSchema.parse({
      id: 'codex_approval_state_1',
      schemaVersion,
      createdAt,
      approvalRecordId: 'codex_approval_record_1',
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_1',
      policyDecisionHash: 'sha256:policy',
      status: 'pending',
      requestedStatus: 'pending',
      expiresAt: '2026-04-28T01:00:00.000Z',
      expired: false,
      terminal: false,
      canDecide: true,
      nextAllowedActions: ['approve', 'deny', 'revoke'],
      reasons: ['manual approval is awaiting a decision'],
      summary: 'Manual approval state is pending',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const transition = CodexExecApprovalTransitionResultSchema.parse({
      id: 'codex_approval_transition_1',
      schemaVersion,
      createdAt,
      approvalRecordId: 'codex_approval_record_1',
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      action: 'approve',
      fromStatus: 'pending',
      toStatus: 'approved',
      allowed: true,
      reasons: ['manual approval transition approve is allowed'],
      state: approvalState,
      summary: 'Manual approval transition approve allowed',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(approvalState.canDecide).toBe(true);
    expect(transition.allowed).toBe(true);
    expect(transition.liveExecution).toBe(false);
  });

  it('parses codex control-plane timeline models', () => {
    const timeline = CodexExecControlPlaneTimelineSchema.parse({
      id: 'codex_timeline_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      status: 'gate_blocked',
      events: [
        {
          id: 'codex_timeline_event_1',
          schemaVersion,
          createdAt,
          dryRunId: 'codex_dry_run_1',
          liveRunRecordId: 'codex_live_run_1',
          eventType: 'codex.exec.dry_run.created',
          sourceKind: 'dry_run',
          sourceId: 'codex_dry_run_1',
          status: 'medium',
          summary: 'Dry-run control plan',
          occurredAt: createdAt,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        },
        {
          id: 'codex_timeline_event_2',
          schemaVersion,
          createdAt,
          dryRunId: 'codex_dry_run_1',
          liveRunRecordId: 'codex_live_run_1',
          eventType: 'codex.exec.gate.evaluated',
          sourceKind: 'gate',
          sourceId: 'codex_gate_1',
          status: 'blocked',
          summary: 'Execution gate blocked',
          occurredAt: createdAt,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        },
      ],
      eventCount: 2,
      evidenceCount: 1,
      auditEventCount: 1,
      summary: 'Timeline has 2 events',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(timeline.status).toBe('gate_blocked');
    expect(timeline.events.every((event) => event.liveExecution === false)).toBe(true);
    expect(timeline.events.every((event) => event.externalProcessStarted === false)).toBe(true);
    expect(timeline.events.every((event) => event.executionDisabled === true)).toBe(true);
  });

  it('parses codex timeline query and detail view models without body storage', () => {
    const filter = CodexExecTimelineFilterSchema.parse({
      source: 'approval',
      status: 'blocked',
      includeEvidence: false,
      includeAudit: false,
      limit: 10,
    });
    const query = CodexExecTimelineQuerySchema.parse({
      id: 'codex_timeline_query_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      filter,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const detail = CodexExecTimelineDetailViewSchema.parse({
      id: 'codex_timeline_detail_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      timeline: {
        id: 'codex_timeline_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        status: 'gate_blocked',
        events: [],
        eventCount: 0,
        evidenceCount: 1,
        auditEventCount: 1,
        summary: 'Timeline has no filtered events',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      sourceBreakdown: {},
      latestGateStatus: 'blocked',
      approvalStatus: 'approved',
      dryRunSummary: {
        dryRunPlanId: 'codex_dry_run_1',
        title: 'Summarize repository structure',
        sandboxMode: 'read_only',
        approvalMode: 'required',
        riskLevel: 'medium',
        promptSummary: 'Prompt summary only',
        promptHash: 'sha256:prompt',
        promptLength: 30,
        promptBodyStored: false,
      },
      commandPreviewSummary: {
        commandPreviewId: 'codex_preview_1',
        previewSummary: 'Preview summary only',
        previewHash: 'sha256:preview',
        redacted: true,
        argumentSummary: 'promptHash=sha256:prompt',
      },
      policySummary: {
        policyDecisionId: 'policy_1',
        outcome: 'deny',
        riskLevel: 'medium',
        requiresDryRun: true,
        requiresApproval: true,
        reasonCount: 1,
      },
      approvalStateSummary: {
        approvalRequestId: 'codex_approval_request_1',
        status: 'approved',
        canDecide: false,
        terminal: true,
        reasonCount: 1,
      },
      gateSummary: {
        executionGateResultId: 'codex_gate_1',
        status: 'blocked',
        reasonCount: 1,
        liveEnabled: false,
      },
      evidenceSummary: {
        id: 'codex_evidence_summary_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        count: 1,
        evidenceRefIds: ['evidence_1'],
        items: [
          {
            evidenceRefId: 'evidence_1',
            kind: 'codex.exec.dry_run_plan',
            summary: 'Evidence summary only',
            hash: 'sha256:evidence',
            labels: ['codex.dry_run_plan'],
            createdAt,
          },
        ],
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      auditSummary: {
        id: 'codex_audit_summary_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        count: 1,
        auditEventIds: ['audit_1'],
        items: [
          {
            auditEventId: 'audit_1',
            action: 'codex.exec.policy_evaluated',
            outcome: 'deny',
            createdAt,
            policyDecisionId: 'policy_1',
            evidenceRefIds: ['evidence_1'],
          },
        ],
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: 'Detail summary only',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(query.filter.source).toBe('approval');
    expect(detail.evidenceSummary.bodyStored).toBe(false);
    expect(detail.auditSummary.metadataOnly).toBe(true);
    expect(JSON.stringify(detail)).not.toContain('full prompt body');
  });

  it('parses codex evidence and audit drilldown views without body storage', () => {
    const evidenceDetail = CodexExecEvidenceDetailViewSchema.parse({
      id: 'codex_evidence_detail_1',
      schemaVersion,
      createdAt,
      status: 'found',
      evidenceRefId: 'evidence_1',
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      kind: 'codex.exec.dry_run_plan',
      summary: 'Evidence summary only',
      hash: 'sha256:evidence',
      labels: ['codex.dry_run_plan'],
      refCreatedAt: createdAt,
      relatedAuditEventIds: ['audit_1'],
      metadataSummary: {
        keyCount: 2,
        keys: ['dryRunPlanId', 'riskLevel'],
        relatedIds: ['codex_dry_run_1'],
        bodyStored: false,
      },
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const auditDetail = CodexExecAuditDetailViewSchema.parse({
      id: 'codex_audit_detail_1',
      schemaVersion,
      createdAt,
      status: 'found',
      auditEventId: 'audit_1',
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      action: 'codex.exec.policy_evaluated',
      outcome: 'deny',
      actor: 'codex-kernel.control-plane',
      eventCreatedAt: createdAt,
      policyDecisionId: 'policy_1',
      evidenceRefIds: ['evidence_1'],
      metadataSummary: {
        keyCount: 2,
        keys: ['dryRunPlanId', 'policyDecisionId'],
        relatedIds: ['codex_dry_run_1', 'policy_1'],
        bodyStored: false,
      },
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const evidenceSearch = CodexExecEvidenceSearchResultSchema.parse({
      id: 'codex_evidence_search_1',
      schemaVersion,
      createdAt,
      query: {
        id: 'codex_evidence_query_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        kind: 'codex.exec.dry_run_plan',
        limit: 20,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      count: 1,
      items: [evidenceDetail],
      metadataOnly: true,
      bodyStored: false,
      summary: '1 evidence refs',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const auditSearch = CodexExecAuditSearchResultSchema.parse({
      id: 'codex_audit_search_1',
      schemaVersion,
      createdAt,
      query: {
        id: 'codex_audit_query_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        action: 'codex.exec.policy_evaluated',
        limit: 20,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      count: 1,
      items: [auditDetail],
      metadataOnly: true,
      bodyStored: false,
      summary: '1 audit events',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const drilldown = CodexExecControlPlaneDrilldownViewSchema.parse({
      id: 'codex_drilldown_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      status: 'found',
      evidenceSearch,
      auditSearch,
      selectedEvidence: evidenceDetail,
      selectedAudit: auditDetail,
      evidenceCount: 1,
      auditEventCount: 1,
      metadataOnly: true,
      bodyStored: false,
      summary: 'Read-only drilldown summary',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(drilldown.status).toBe('found');
    expect(drilldown.evidenceSearch.items[0]?.metadataOnly).toBe(true);
    expect(drilldown.auditSearch.items[0]?.bodyStored).toBe(false);
    expect(JSON.stringify(drilldown)).not.toContain('full command body');
  });

  it('parses codex control-plane report export models', () => {
    const query = {
      id: 'codex_report_query_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const section = {
      id: 'codex_report_section_1',
      schemaVersion,
      createdAt,
      kind: 'overview',
      title: 'Overview',
      status: 'ok',
      summary: 'Report overview summary only',
      items: [
        {
          label: 'dryRunId',
          value: 'codex_dry_run_1',
          refId: 'codex_dry_run_1',
        },
      ],
      refIds: ['codex_dry_run_1'],
      hashes: ['sha256:summary'],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const summary = {
      id: 'codex_report_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'found',
      sectionCount: 10,
      evidenceCount: 1,
      auditEventCount: 1,
      riskLevel: 'medium',
      finalControlPlaneStatus: 'gate_blocked',
      recommendationCount: 1,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const report = CodexExecControlPlaneReportSchema.parse({
      id: 'codex_report_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'found',
      format: 'markdown',
      query,
      summary,
      sections: [section],
      sectionOrder: [
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
      ],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const exportResult = CodexExecControlPlaneReportExportResultSchema.parse({
      id: 'codex_report_export_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      format: 'markdown',
      status: 'found',
      report,
      renderedContent: '# Safe report',
      renderedContentHash: 'sha256:rendered',
      renderedContentLength: 13,
      metadataOnly: true,
      sourceBodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(report.sections[0]?.bodyStored).toBe(false);
    expect(exportResult.report.summary.sectionCount).toBe(10);
    expect(JSON.stringify(exportResult)).not.toContain('full stdout body');
  });

  it('parses codex report review workflow models', () => {
    const checklistItem = {
      id: 'codex_report_review_check_1',
      schemaVersion,
      createdAt,
      code: 'no_live_flags_present',
      label: 'No-live flags are present',
      status: 'passed',
      required: true,
      summary: 'liveExecution=false, externalProcessStarted=false, executionDisabled=true',
      relatedSection: 'no_live_boundary',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const finding = {
      id: 'codex_report_review_finding_1',
      schemaVersion,
      createdAt,
      severity: 'medium',
      code: 'approval_state_missing',
      summary: 'Approval state is missing from the reviewed report summary.',
      relatedSection: 'approval',
      recommendation: 'Create a manual approval request before any later ADR review.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const record = CodexExecReportReviewRecordSchema.parse({
      id: 'codex_report_review_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      reportId: 'codex_report_1',
      reportHash: 'sha256:report',
      reportSectionHashes: ['sha256:overview'],
      sectionSummaryRefs: ['overview'],
      reviewedAt: createdAt,
      reviewerLabel: 'local-operator',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      recommendationGrantsExecution: false,
      riskClassification: 'medium',
      checklistItems: [checklistItem],
      findings: [finding],
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const summary = CodexExecReportReviewSummarySchema.parse({
      id: 'codex_report_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      dryRunId: record.dryRunId,
      reportHash: record.reportHash,
      status: record.status,
      recommendation: record.recommendation,
      recommendationGrantsExecution: false,
      riskClassification: record.riskClassification,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      findingCount: record.findings.length,
      failedChecklistCount: 0,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const historyQuery = {
      id: 'codex_report_review_history_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      limit: 20,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const comparisonItem = CodexExecReportReviewComparisonItemSchema.parse({
      id: 'codex_report_review_comparison_item_1',
      schemaVersion,
      createdAt,
      field: 'status',
      leftValueSummary: 'reviewed',
      rightValueSummary: 'changes_requested',
      changed: true,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const comparison = CodexExecReportReviewComparisonSchema.parse({
      id: 'codex_report_review_comparison_1',
      schemaVersion,
      createdAt,
      leftReviewId: 'codex_report_review_1',
      rightReviewId: 'codex_report_review_2',
      dryRunId: record.dryRunId,
      comparable: true,
      summary: 'Review metadata changed across 1 fields.',
      changedItemCount: 1,
      items: [comparisonItem],
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const history = CodexExecReportReviewHistoryViewSchema.parse({
      id: 'codex_report_review_history_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      query: historyQuery,
      latestReview: summary,
      summaries: [summary],
      comparison,
      historyCount: 1,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const handoff = CodexExecReviewerHandoffSummarySchema.parse({
      id: 'codex_reviewer_handoff_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      fromReviewer: 'local-operator',
      toReviewer: 'next-reviewer',
      latestReviewId: record.id,
      latestStatus: record.status,
      latestRecommendation: record.recommendation,
      latestRiskClassification: record.riskClassification,
      reviewCount: 1,
      findingCount: record.findings.length,
      failedChecklistCount: 0,
      handoffSummary: 'Handoff summary is metadata-only and non-executing.',
      recommendedNextStep: 'Continue read-only ADR preparation.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceQuery = CodexExecGovernanceReviewPackageQuerySchema.parse({
      id: 'codex_governance_package_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      includeEvidence: true,
      includeAudit: true,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrCheck = CodexExecAdrReadinessChecklistItemSchema.parse({
      id: 'codex_adr_readiness_check_1',
      schemaVersion,
      createdAt,
      code: 'no_live_boundary_confirmed',
      label: 'No-live boundary is confirmed',
      status: 'passed',
      required: true,
      summary: 'No live execution or external process was started.',
      sourceSection: 'no_live_boundary',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const noLiveEvidence = CodexExecNoLiveEvidenceSummarySchema.parse({
      id: 'codex_no_live_evidence_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      noRealCodexExec: true,
      noExternalProcessStarted: true,
      noBrowserOrCdpAction: true,
      noWorkspaceWrite: true,
      noExecutionApprovalGranted: true,
      evidenceRefCount: 1,
      auditEventCount: 1,
      evidenceKinds: ['codex.exec.dry_run_plan'],
      auditActions: ['codex.exec.policy_evaluated'],
      summary: 'No-live evidence is metadata-only.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceBlocker = CodexExecGovernanceBlockerSchema.parse({
      id: 'codex_governance_blocker_1',
      schemaVersion,
      createdAt,
      severity: 'medium',
      code: 'review_history_missing',
      summary: 'Review history should be present before ADR review.',
      sourceSection: 'review_history',
      recommendedResolution: 'Create a non-executing report review history.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceSummary = CodexExecGovernanceReviewPackageSummarySchema.parse({
      id: 'codex_governance_package_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'needs_changes',
      riskClassification: 'medium',
      recommendation: 'needs_changes',
      recommendationGrantsExecution: false,
      checklistPassedCount: 1,
      checklistWarningCount: 0,
      checklistFailedCount: 0,
      blockerCount: 1,
      unresolvedBlockerCount: 1,
      evidenceRefCount: 1,
      auditEventCount: 1,
      latestReviewId: record.id,
      reportId: 'codex_report_1',
      handoffId: handoff.id,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governancePackage = CodexExecGovernanceReviewPackageSchema.parse({
      id: 'codex_governance_package_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'needs_changes',
      query: governanceQuery,
      summary: governanceSummary,
      sectionOrder: [
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
      ],
      reviewHistory: history,
      latestReview: summary,
      handoff,
      noLiveEvidence,
      adrReadinessChecklist: [adrCheck],
      blockers: [governanceBlocker],
      riskClassification: 'medium',
      recommendation: 'needs_changes',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftQuery = CodexExecLiveAdapterAdrDraftQuerySchema.parse({
      id: 'codex_adr_draft_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftSection = CodexExecLiveAdapterAdrDraftSectionSchema.parse({
      id: 'codex_adr_draft_section_1',
      schemaVersion,
      createdAt,
      kind: 'recommended_decision',
      title: 'Recommended Decision',
      status: 'blocked',
      summary: 'Recommendation is ADR guidance only and does not grant execution.',
      items: [
        {
          label: 'recommendation',
          value: 'needs_changes',
        },
      ],
      refIds: [governancePackage.id],
      hashes: ['sha256:adr-draft-section'],
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftSummary = CodexExecLiveAdapterAdrDraftSummarySchema.parse({
      id: 'codex_adr_draft_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      title: 'ADR Draft: Codex control-plane live adapter readiness',
      sectionCount: 1,
      governancePackageStatus: governancePackage.status,
      riskClassification: governancePackage.riskClassification,
      recommendation: governancePackage.recommendation,
      recommendationGrantsExecution: false,
      blockerCount: governancePackage.blockers.length,
      readinessPassedCount: 1,
      readinessFailedCount: 0,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraft = CodexExecLiveAdapterAdrDraftSchema.parse({
      id: 'codex_adr_draft_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      format: 'markdown',
      query: adrDraftQuery,
      title: 'ADR Draft: Codex control-plane live adapter readiness',
      summary: adrDraftSummary,
      governancePackageSummary: governancePackage.summary,
      governancePackage,
      sections: [adrDraftSection],
      sectionOrder: ['recommended_decision'],
      recommendation: governancePackage.recommendation,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftExport = CodexExecLiveAdapterAdrDraftExportResultSchema.parse({
      id: 'codex_adr_draft_export_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      format: 'markdown',
      status: 'blocked',
      draft: adrDraft,
      renderedContent: '# ADR Draft\n\nThis is metadata-only guidance.',
      renderedContentHash: 'sha256:adr-draft',
      renderedContentLength: 40,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      sourceBodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.recommendation).toBe('ready_for_adr');
    expect(history.latestReview?.reviewId).toBe(record.id);
    expect(comparison.recommendationGrantsExecution).toBe(false);
    expect(handoff.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.noLiveEvidence.noRealCodexExec).toBe(true);
    expect(adrDraft.draftOnly).toBe(true);
    expect(adrDraft.recommendationGrantsExecution).toBe(false);
    expect(adrDraftExport.sourceBodyStored).toBe(false);
    expect(JSON.stringify(record)).not.toContain('full command body');
    expect(JSON.stringify(history)).not.toContain('full command body');
    expect(JSON.stringify(handoff)).not.toContain('full command body');
    expect(JSON.stringify(governancePackage)).not.toContain('full command body');
    expect(JSON.stringify(adrDraft)).not.toContain('full command body');
  });

  it('parses live adapter ADR decision records without granting execution', () => {
    const gatePolicy = CodexExecLiveAdapterAdrDecisionGatePolicySchema.parse({
      id: 'codex_live_adapter_adr_gate_policy_1',
      schemaVersion,
      createdAt,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      triggerSurface: 'cli_only',
      dashboardTriggerAllowed: false,
      dryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceRequired: true,
      auditRequired: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const evidenceRef = {
      id: 'evidence_adr_decision_1',
      schemaVersion,
      createdAt,
      kind: 'codex.exec.live_adapter_adr_decision',
      summary: 'ADR decision evidence is metadata-only.',
      hash: 'sha256:adr-decision',
      redacted: true,
      labels: ['codex.live_adapter_adr_decision'],
    };
    const record = CodexExecLiveAdapterAdrDecisionRecordSchema.parse({
      id: 'codex_live_adapter_adr_decision_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      adrDocumentPath: 'docs/adr/round-3n-live-adapter-adr.md',
      decisionDocumentPath: 'docs/adr/round-3n-go-no-go-decision.md',
      decision: 'conditional_read_only_go',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Conditional read-only design can continue; implementation is not approved.',
      recordedAt: createdAt,
      gatePolicy,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      futureTriggerPolicy: 'cli_only',
      dashboardTriggerAllowed: false,
      dryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceRequired: true,
      auditRequired: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      evidenceRefs: [evidenceRef],
      auditEventIds: ['audit_adr_decision_1'],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const summary = CodexExecLiveAdapterAdrDecisionSummarySchema.parse({
      id: 'codex_live_adapter_adr_decision_summary_1',
      schemaVersion,
      createdAt,
      decisionId: record.id,
      dryRunId: record.dryRunId,
      decision: record.decision,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      rationaleSummary: record.rationaleSummary,
      allowedSandboxModes: record.allowedSandboxModes,
      forbiddenSandboxModes: record.forbiddenSandboxModes,
      futureTriggerPolicy: 'cli_only',
      dashboardTriggerAllowed: false,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceCount: 1,
      auditEventCount: 1,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const query = CodexExecLiveAdapterAdrDecisionQuerySchema.parse({
      id: 'codex_live_adapter_adr_decision_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'recorded',
      decision: 'conditional_read_only_go',
      limit: 10,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      dashboardTriggerAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(record.decision).toBe('conditional_read_only_go');
    expect(record.allowedSandboxModes).toEqual(['read_only']);
    expect(record.forbiddenSandboxModes).toEqual(['workspace_write', 'danger_full_access']);
    expect(record.dashboardTriggerAllowed).toBe(false);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.evidenceCount).toBe(1);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');
  });

  it('parses read-only adapter preflight simulator contracts with fixed no-live flags', () => {
    const checklistItem = CodexExecReadOnlyAdapterOperatorChecklistItemSchema.parse({
      id: 'codex_read_only_checklist_1',
      schemaVersion,
      createdAt,
      code: 'dry_run_reviewed',
      label: 'Dry-run reviewed',
      summary: 'Operator reviewed metadata-only dry-run summary.',
      checked: true,
      required: true,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const check = CodexExecReadOnlyAdapterPreflightSimulationCheckSchema.parse({
      id: 'codex_read_only_preflight_check_1',
      schemaVersion,
      createdAt,
      code: 'sandbox_read_only_only',
      source: 'sandbox',
      status: 'passed',
      required: true,
      summary: 'Sandbox is read_only.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const blocker = CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema.parse({
      id: 'codex_read_only_preflight_blocker_1',
      schemaVersion,
      createdAt,
      code: 'approval_artifact_exists',
      source: 'approval',
      severity: 'high',
      relatedCheckCode: 'approval_artifact_exists',
      summary: 'Approval artifact is missing.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const input = CodexExecReadOnlyAdapterPreflightSimulationInputSchema.parse({
      id: 'codex_read_only_preflight_input_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      requestedSandboxMode: 'read_only',
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: [checklistItem],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const result = CodexExecReadOnlyAdapterPreflightSimulationResultSchema.parse({
      id: 'codex_read_only_preflight_result_1',
      schemaVersion,
      createdAt,
      dryRunId: input.dryRunId,
      status: 'failed',
      requestedSandboxMode: 'read_only',
      checks: [check],
      blockers: [blocker],
      operatorChecklist: [checklistItem],
      configLiveEnabled: false,
      dryRunExists: true,
      policyDecisionExists: true,
      approvalArtifactExists: false,
      approvalArtifactValid: false,
      dryRunPlanHashMatched: false,
      policyDecisionHashMatched: false,
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      checklistComplete: true,
      adrDecisionDesignOnly: true,
      passedCheckCount: 1,
      failedCheckCount: 1,
      warningCheckCount: 0,
      blockerCount: 1,
      summary: 'Simulation failed because approval artifact is missing.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterPreflightSimulationSummarySchema.parse({
      id: 'codex_read_only_preflight_summary_1',
      schemaVersion,
      createdAt,
      simulationId: result.id,
      dryRunId: result.dryRunId,
      status: result.status,
      requestedSandboxMode: 'read_only',
      passedCheckCount: 1,
      failedCheckCount: 1,
      warningCheckCount: 0,
      blockerCount: 1,
      checklistCompletedCount: 1,
      checklistTotalCount: 1,
      summary: result.summary,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(result.liveExecution).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.executionDisabled).toBe(true);
    expect(result.processAdapterStarted).toBe(false);
    expect(result.implementationApproved).toBe(false);
    expect(result.dashboardTriggerAllowed).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(summary.status).toBe('failed');
  });

  it('parses read-only adapter simulator review contracts without granting execution', () => {
    const checklistItem = CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_check_1',
      schemaVersion,
      createdAt,
      code: 'simulator_check_approval_artifact_exists',
      label: 'Approval Artifact Exists',
      checkCode: 'approval_artifact_exists',
      disposition: 'hard_gate',
      status: 'failed',
      required: true,
      summary: 'Approval artifact is missing.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const finding = CodexExecReadOnlyAdapterSimulatorReviewFindingSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_finding_1',
      schemaVersion,
      createdAt,
      code: checklistItem.code,
      severity: 'high',
      relatedCheckCode: checklistItem.checkCode,
      disposition: 'hard_gate',
      summary: checklistItem.summary,
      recommendation: 'Resolve this hard gate before implementation planning exits.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const blocker = CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema.parse({
      id: 'codex_read_only_preflight_blocker_2',
      schemaVersion,
      createdAt,
      code: 'approval_artifact_exists',
      source: 'approval',
      severity: 'high',
      relatedCheckCode: 'approval_artifact_exists',
      summary: 'Approval artifact is missing.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const record = CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      simulationId: 'codex_read_only_preflight_result_1',
      simulationStatus: 'failed',
      outcome: 'go_to_implementation_planning',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Implementation planning may continue, but implementation and process adapter remain unapproved.',
      reviewedAt: createdAt,
      checklistItems: [checklistItem],
      findings: [finding],
      simulatorBlockers: [blocker],
      hardGateCount: 1,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedBlockerCount: 1,
      evidenceRefs: [],
      auditEventIds: ['audit_simulator_review_1'],
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterSimulatorReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_simulator_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      dryRunId: record.dryRunId,
      simulationId: record.simulationId,
      simulationStatus: record.simulationStatus,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      hardGateCount: 1,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedBlockerCount: 1,
      summary: 'Review allows implementation planning only.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const query = CodexExecReadOnlyAdapterSimulatorReviewQuerySchema.parse({
      id: 'codex_read_only_adapter_simulator_review_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'recorded',
      outcome: 'go_to_implementation_planning',
      limit: 10,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(record.outcome).toBe('go_to_implementation_planning');
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');
  });

  it('parses implementation plan review contracts without granting execution', () => {
    const checklistItem = CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema.parse(
      {
        id: 'codex_read_only_adapter_implementation_plan_review_check_1',
        schemaVersion,
        createdAt,
        code: 'cli_only_trigger',
        label: 'CLI-only trigger',
        disposition: 'hard_gate',
        status: 'passed',
        required: true,
        summary: 'Future skeleton remains CLI-only and disabled by default.',
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
      },
    );
    const finding = CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_finding_1',
      schemaVersion,
      createdAt,
      code: 'skeleton_only_if_approved',
      severity: 'medium',
      relatedChecklistCode: 'skeleton_only_if_approved',
      disposition: 'requires_review',
      summary: 'Round 3T scope must remain disabled-by-default skeleton only.',
      recommendation: 'Confirm this during Round 3S before allowing skeleton work.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const record = CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_1',
      schemaVersion,
      createdAt,
      planDocumentPath: 'docs/design/round-3r-read-only-adapter-implementation-plan.md',
      planDocumentHash: 'sha256:implementation-plan',
      outcome: 'conditional_go_to_disabled_skeleton',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Conditional skeleton work may continue, but process adapter and execution remain unapproved.',
      reviewedAt: createdAt,
      disabledSkeletonApproved: true,
      checklistItems: [checklistItem],
      findings: [finding],
      hardGateCount: 1,
      requiresReviewCount: 1,
      informationalCount: 0,
      unresolvedFindingCount: 1,
      evidenceRefs: [],
      auditEventIds: ['audit_implementation_plan_review_1'],
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      planDocumentPath: record.planDocumentPath,
      planDocumentHash: record.planDocumentHash,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      disabledSkeletonApproved: true,
      hardGateCount: 1,
      requiresReviewCount: 1,
      informationalCount: 0,
      unresolvedFindingCount: 1,
      summary: 'Conditional skeleton approval is not execution approval.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const query = CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_query_1',
      schemaVersion,
      createdAt,
      status: 'recorded',
      outcome: 'conditional_go_to_disabled_skeleton',
      limit: 10,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(record.disabledSkeletonApproved).toBe(true);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(record.workspaceWriteAllowed).toBe(false);
    expect(record.dangerFullAccessAllowed).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');

    expect(() =>
      CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema.parse({
        ...record,
        id: 'codex_read_only_adapter_implementation_plan_review_invalid',
        outcome: 'no_go',
        disabledSkeletonApproved: true,
      }),
    ).toThrow();
  });

  it('parses disabled skeleton, fixture boundary, and final readiness contracts', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const config = CodexExecReadOnlyAdapterSkeletonConfigSchema.parse({
      id: 'codex_read_only_adapter_skeleton_config_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      explicitEnableRequired: true,
      configuredEnabled: false,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      cliOnly: true,
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
      ...flagFields,
    });
    const preview = CodexExecReadOnlyAdapterSkeletonPreviewSchema.parse({
      id: 'codex_read_only_adapter_skeleton_preview_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      config,
      disabledReasons: [],
      summary: 'Disabled skeleton preview only.',
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
      ...flagFields,
    });
    const skeletonReview = CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_skeleton_review_1',
      schemaVersion,
      createdAt,
      skeletonPreviewId: preview.id,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Fixture-backed boundary only; no process adapter approval.',
      reviewedAt: createdAt,
      fixtureBoundaryAllowed: true,
      checklistItems: [],
      findings: [],
      hardGateCount: 0,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedFindingCount: 0,
      evidenceRefs: [],
      auditEventIds: [],
      ...flagFields,
    });
    const skeletonSummary = CodexExecReadOnlyAdapterSkeletonReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_skeleton_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: skeletonReview.id,
      skeletonPreviewId: preview.id,
      outcome: skeletonReview.outcome,
      status: skeletonReview.status,
      reviewerLabel: skeletonReview.reviewerLabel,
      reviewedAt: createdAt,
      fixtureBoundaryAllowed: true,
      hardGateCount: 0,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedFindingCount: 0,
      summary: 'Skeleton accepted for fixture-backed replay boundary only.',
      ...flagFields,
    });
    const fixtureBoundary = CodexExecReadOnlyAdapterFixtureBoundaryResultSchema.parse({
      id: 'codex_read_only_adapter_fixture_boundary_1',
      schemaVersion,
      createdAt,
      input: {
        id: 'codex_read_only_adapter_fixture_boundary_input_1',
        schemaVersion,
        createdAt,
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixtureOnly: true,
        ...flagFields,
      },
      status: 'completed',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      fixturePathHash: 'sha256:fixture-path',
      fixtureOnly: true,
      eventCount: 1,
      itemCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      events: [],
      evidenceRefs: [],
      auditEvents: [],
      auditEventIds: [],
      summary: 'Fixture-backed replay boundary completed.',
      ...flagFields,
    });
    const fixtureSummary = CodexExecReadOnlyAdapterFixtureBoundarySummarySchema.parse({
      id: 'codex_read_only_adapter_fixture_boundary_summary_1',
      schemaVersion,
      createdAt,
      boundaryResultId: fixtureBoundary.id,
      status: fixtureBoundary.status,
      fixturePath: fixtureBoundary.fixturePath,
      fixturePathHash: fixtureBoundary.fixturePathHash,
      fixtureOnly: true,
      eventCount: 1,
      itemCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      summary: 'Fixture-backed replay boundary completed.',
      ...flagFields,
    });
    const finalReadiness = CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_final_readiness_1',
      schemaVersion,
      createdAt,
      outcome: 'ready_for_separate_read_only_adapter_adr',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Separate ADR remains required.',
      reviewedAt: createdAt,
      phaseAStatus: 'disabled',
      phaseBOutcome: 'skeleton_accepted_for_fixture_boundary_only',
      phaseCStatus: 'completed',
      realAdapterRequiresSeparateAdr: true,
      currentRoundApprovesProcessStart: false,
      currentRoundApprovesCodexExecution: false,
      currentRoundApprovesWorkspaceWrites: false,
      evidenceRefs: [],
      auditEventIds: [],
      summary: 'Ready only for a separate future ADR.',
      ...flagFields,
    });
    const finalSummary = CodexExecReadOnlyAdapterFinalReadinessSummarySchema.parse({
      id: 'codex_read_only_adapter_final_readiness_summary_1',
      schemaVersion,
      createdAt,
      decisionId: finalReadiness.id,
      outcome: finalReadiness.outcome,
      status: finalReadiness.status,
      reviewerLabel: finalReadiness.reviewerLabel,
      reviewedAt: createdAt,
      phaseAStatus: 'disabled',
      phaseBOutcome: 'skeleton_accepted_for_fixture_boundary_only',
      phaseCStatus: 'completed',
      realAdapterRequiresSeparateAdr: true,
      summary: 'Ready only for a separate future ADR.',
      ...flagFields,
    });

    expect(config.configuredEnabled).toBe(false);
    expect(preview.noRunnableCommand).toBe(true);
    expect(skeletonSummary.fixtureBoundaryAllowed).toBe(true);
    expect(fixtureSummary.fixtureOnly).toBe(true);
    expect(finalSummary.realAdapterRequiresSeparateAdr).toBe(true);
    expect(finalReadiness.currentRoundApprovesProcessStart).toBe(false);
    expect(finalReadiness.currentRoundApprovesCodexExecution).toBe(false);
    expect(finalReadiness.currentRoundApprovesWorkspaceWrites).toBe(false);
    expect(JSON.stringify(fixtureBoundary)).not.toContain('synthetic stdout body');
  });

  it('parses real read-only adapter readiness contracts without approval semantics', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterReadinessGateSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_gate_1',
      schemaVersion,
      createdAt,
      code: 'fixture_path_guard_symlink_escape',
      label: 'Fixture path guard symlink escape',
      category: 'fixture_boundary',
      disposition: 'requires_review',
      status: 'requires_review',
      required: true,
      summary: 'Symlink escape verification remains pending.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterReadinessBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_blocker_1',
      schemaVersion,
      createdAt,
      code: 'round_3s_conditional_decision_exists',
      severity: 'critical',
      relatedGateCode: 'round_3s_conditional_decision_exists',
      status: 'blocked',
      summary: 'Round 3S conditional decision is missing.',
      recommendation: 'Create an explicit local governance decision before readiness persistence.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterReadinessFindingSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_finding_1',
      schemaVersion,
      createdAt,
      code: 'documented_only_3tw_evidence',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Round 3T-W evidence is documented-only.',
      recommendation: 'Treat this package as requires_review until persisted evidence exists.',
      ...flagFields,
    });
    const checklistItem = CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_check_1',
      schemaVersion,
      createdAt,
      code: 'separate_adr_required',
      label: 'Separate ADR required',
      status: 'passed',
      required: true,
      summary: 'A separate ADR is required before any implementation can be considered.',
      ...flagFields,
    });
    const packageRecord = CodexExecRealReadOnlyAdapterReadinessPackageSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_package_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'ready_for_separate_adr',
      recommendation:
        'Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.',
      governanceDecisionId: 'codex_read_only_adapter_implementation_plan_review_1',
      documentedArtifactRefs: ['docs/reviews/round-3tw-additional-rules-audit.md'],
      gates: [gate],
      blockers: [],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 1,
      requiresReviewCount: 0,
      blockerCount: 0,
      findingCount: 1,
      documentedOnly3twEvidence: false,
      symlinkEscapeVerificationPending: false,
      evidenceRefs: [],
      auditEventIds: ['audit_readiness_1'],
      summary: 'Ready only for a separate ADR review.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterReadinessSummarySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_summary_1',
      schemaVersion,
      createdAt,
      packageId: packageRecord.id,
      dryRunId: packageRecord.dryRunId,
      status: packageRecord.status,
      recommendation: packageRecord.recommendation,
      hardGateCount: 1,
      passedGateCount: 1,
      requiresReviewCount: 0,
      blockerCount: 0,
      findingCount: 1,
      documentedOnly3twEvidence: false,
      symlinkEscapeVerificationPending: false,
      summary: packageRecord.summary,
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterReadinessQuerySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_query_1',
      schemaVersion,
      createdAt,
      dryRunId: packageRecord.dryRunId,
      status: 'ready_for_separate_adr',
      limit: 10,
      ...flagFields,
    });

    expect(blocker.status).toBe('blocked');
    expect(packageRecord.status).toBe('ready_for_separate_adr');
    expect(packageRecord.implementationApproved).toBe(false);
    expect(packageRecord.processAdapterApproved).toBe(false);
    expect(packageRecord.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(packageRecord)).not.toContain('full report markdown');
    expect(JSON.stringify(packageRecord)).not.toContain('prompt body');
    expect(JSON.stringify(packageRecord)).not.toContain('stdout');
  });

  it('parses real read-only adapter readiness review contracts without approval semantics', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const checklistItem = CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_check_1',
      schemaVersion,
      createdAt,
      code: 'unresolved_findings_acknowledged',
      label: 'Unresolved findings acknowledged',
      status: 'passed',
      required: true,
      summary: 'Required finding codes were acknowledged.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_finding_1',
      schemaVersion,
      createdAt,
      code: 'symlink_escape_verification_pending',
      severity: 'medium',
      status: 'requires_review',
      relatedReadinessFindingId: 'codex_real_read_only_adapter_readiness_finding_1',
      relatedReadinessFindingCode: 'symlink_escape_verification_pending',
      summary: 'Symlink escape verification is pending.',
      recommendation: 'Acknowledge before ADR drafting and verify before any boundary work.',
      ...flagFields,
    });
    const record = CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_1',
      schemaVersion,
      createdAt,
      packageId: 'codex_real_read_only_adapter_readiness_package_1',
      dryRunId: 'codex_dry_run_1',
      packageStatus: 'requires_review',
      outcome: 'conditional_go_to_separate_adr_draft',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      reviewedAt: createdAt,
      separateAdrDraftAllowed: true,
      acknowledgedFindingCodes: [
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ],
      acknowledgedFindingIds: ['codex_real_read_only_adapter_readiness_finding_1'],
      unresolvedFindingCount: 2,
      checklistItems: [checklistItem],
      findings: [finding],
      evidenceRefs: [
        {
          id: 'evidence_readiness_review_1',
          schemaVersion,
          createdAt,
          kind: 'codex.exec.real_read_only_adapter.readiness_review',
          hash: 'sha256:readiness-review',
          summary: 'Readiness review summary only',
        },
      ],
      auditEventIds: ['audit_readiness_review_1'],
      summary:
        'ADR drafting only. Does not grant implementation, process launch, or execution permission.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      packageId: record.packageId,
      dryRunId: record.dryRunId,
      packageStatus: record.packageStatus,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      separateAdrDraftAllowed: true,
      acknowledgedFindingCodes: record.acknowledgedFindingCodes,
      acknowledgedFindingIds: record.acknowledgedFindingIds,
      unresolvedFindingCount: record.unresolvedFindingCount,
      summary: record.summary,
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_query_1',
      schemaVersion,
      createdAt,
      packageId: record.packageId,
      dryRunId: record.dryRunId,
      status: 'recorded',
      outcome: 'conditional_go_to_separate_adr_draft',
      limit: 10,
      ...flagFields,
    });

    expect(record.separateAdrDraftAllowed).toBe(true);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full report markdown');
    expect(JSON.stringify(record)).not.toContain('prompt body');
    expect(JSON.stringify(record)).not.toContain('stdout');

    expect(() =>
      CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_readiness_review_invalid',
        outcome: 'no_go_to_separate_adr_draft',
        separateAdrDraftAllowed: true,
      }),
    ).toThrow();
  });

  it('parses real read-only adapter contract models as metadata-only non-approval records', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const noRunnableFields = {
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
    } as const;
    const config = CodexExecRealReadOnlyAdapterConfigSchema.parse({
      id: 'codex_real_read_only_adapter_config_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      defaultEnabled: false,
      configuredEnabled: false,
      explicitEnableRequired: true,
      cliOnly: true,
      dashboardTriggerForbidden: true,
      allowedSandboxMode: 'read_only',
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      existingDryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashRequired: true,
      policyDecisionHashRequired: true,
      isolatedWorktreeRequired: true,
      cleanWorktreeRequired: true,
      metadataEvidenceOnly: true,
      summary: 'Read-only adapter config is disabled by default.',
      ...flagFields,
      ...noRunnableFields,
    });
    const request = CodexExecRealReadOnlyAdapterRequestSchema.parse({
      id: 'codex_real_read_only_adapter_request_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      configId: config.id,
      approvalArtifactId: 'codex_approval_artifact_1',
      policyDecisionId: 'policy_1',
      requestedSandboxMode: 'read_only',
      triggerKind: 'cli',
      existingDryRunRequired: true,
      summary: 'Metadata-only request for a future read-only adapter attempt.',
      ...flagFields,
      ...noRunnableFields,
    });
    const boundaryPlan = CodexExecRealReadOnlyAdapterBoundaryPlanSchema.parse({
      id: 'codex_real_read_only_adapter_boundary_plan_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      processBoundaryDeferred: true,
      adapterModuleRef: '@codexhub/codex-kernel/read-only-adapter',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionHash: 'sha256:policy',
      approvalArtifactHash: 'sha256:approval',
      evidencePlanSummary: 'Metadata and hashes only.',
      auditPlanSummary: 'Audit before, after, abort, and failure.',
      summary: 'Boundary planning metadata only; no runnable command is stored.',
      ...flagFields,
      ...noRunnableFields,
    });
    const check = CodexExecRealReadOnlyAdapterPreflightCheckSchema.parse({
      id: 'codex_real_read_only_adapter_preflight_check_1',
      schemaVersion,
      createdAt,
      code: 'config_default_disabled',
      label: 'Config default disabled',
      status: 'passed',
      required: true,
      summary: 'Default config remains disabled.',
      ...flagFields,
    });
    const preflight = CodexExecRealReadOnlyAdapterPreflightSchema.parse({
      id: 'codex_real_read_only_adapter_preflight_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      configId: config.id,
      status: 'passed',
      requestedSandboxMode: 'read_only',
      boundaryPlan,
      checks: [check],
      hardGateCount: 1,
      passedGateCount: 1,
      failedGateCount: 0,
      requiresReviewCount: 0,
      blockerCount: 0,
      summary: 'Preflight contract is metadata only.',
      ...flagFields,
    });
    const error = CodexExecRealReadOnlyAdapterErrorSchema.parse({
      id: 'codex_real_read_only_adapter_error_1',
      schemaVersion,
      createdAt,
      code: 'boundary_deferred',
      severity: 'medium',
      relatedCheckCode: check.code,
      messageSummary: 'Boundary remains deferred in P1.',
      remediationSummary: 'Proceed only after the next gated round.',
      absolutePathLeaked: false,
      ...flagFields,
    });
    const evidenceSummary = CodexExecRealReadOnlyAdapterEvidenceSummarySchema.parse({
      id: 'codex_real_read_only_adapter_evidence_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      evidenceRefIds: ['evidence_1'],
      eventHashCount: 1,
      outputHashCount: 0,
      metadataHash: 'sha256:metadata',
      redacted: true,
      summary: 'Evidence summary is metadata-only.',
      ...flagFields,
    });
    const auditSummary = CodexExecRealReadOnlyAdapterAuditSummarySchema.parse({
      id: 'codex_real_read_only_adapter_audit_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      auditEventIds: ['audit_1'],
      beforeStartRequired: true,
      afterFinishRequired: true,
      abortRequired: true,
      failureRequired: true,
      eventCount: 1,
      summary: 'Audit summary requires before, after, abort, and failure events.',
      ...flagFields,
    });
    const result = CodexExecRealReadOnlyAdapterResultSchema.parse({
      id: 'codex_real_read_only_adapter_result_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      preflightId: preflight.id,
      status: 'blocked',
      boundaryPlanId: boundaryPlan.id,
      error,
      evidenceSummary,
      auditSummary,
      postRunVerificationRequired: true,
      workspaceMutationAllowed: false,
      unexpectedWorkspaceDiffCritical: true,
      autoRevertAllowed: false,
      summary: 'P1 result contract is non-executing metadata only.',
      ...flagFields,
    });
    const boundaryDiagnostics = CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema.parse({
      id: 'codex_real_read_only_adapter_boundary_diagnostics_1',
      schemaVersion,
      createdAt,
      ...flagFields,
      status: 'failed',
      failureCode: 'process_exit_nonzero',
      startFailureKind: 'none',
      enoentKind: 'none',
      platform: 'win32',
      resolvedExecutableKind: 'native_exe',
      spawnTargetKind: 'native_exe',
      cwdHash: 'sha256:cwd',
      cwdExists: true,
      cwdIsDirectory: true,
      executableHash: 'sha256:executable',
      executableExists: true,
      executableAccessible: true,
      executableResolutionSource: 'direct_path',
      dependencyResolutionStatus: 'not_applicable',
      envAllowlistKeyCount: 5,
      envAllowlistKeyHash: 'sha256:env-keys',
      exitCode: 2,
      nonzeroExitKind: 'codex_cli_usage_error_suspected',
      timedOut: false,
      cancelled: false,
      durationMs: 35,
      stdoutHash: 'sha256:stdout',
      stderrHash: 'sha256:stderr',
      stdoutByteLength: 12,
      stderrByteLength: 14,
      stdoutLineCount: 1,
      stderrLineCount: 1,
      stdoutTruncated: false,
      stderrTruncated: false,
      externalProcessStarted: true,
      governedInputVerified: true,
      governedInputSourceKind: 'governed_file',
      governedInputRelativePathHash: 'sha256:input-path',
      governedInputContentHash: 'sha256:input-content',
      governedInputByteLength: 42,
      governedInputLineCount: 1,
      promptArgumentHash: 'sha256:prompt-argument',
      promptArgumentStored: false,
      summary: 'Boundary diagnostics stores hashes and counts only.',
    });
    const governedBoundaryDeferredDiagnostics =
      CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema.parse({
        id: 'codex_real_read_only_adapter_boundary_deferred_governed_input_1',
        schemaVersion,
        createdAt,
        ...flagFields,
        reasonCode: 'governed_input_missing',
        reasonCodes: ['governed_input_missing'],
        preflightStatus: 'passed',
        runtimeWorktreeProvided: true,
        approvalInputProvided: true,
        executableResolutionStatus: 'resolved',
        cwdSelfCheckStatus: 'passed',
        governedInputProvided: false,
        governedInputVerified: false,
        governedInputReasonCode: 'governed_input_missing',
        processBoundaryReady: false,
        summary: 'Boundary deferred because governed input was not verified.',
      });

    expect(config.defaultEnabled).toBe(false);
    expect(request.dryRunId).toBe('codex_dry_run_1');
    expect(preflight.requestedSandboxMode).toBe('read_only');
    expect(result.executionDisabled).toBe(true);
    expect(result.implementationApproved).toBe(false);
    expect(result.processAdapterApproved).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(result.workspaceWriteAllowed).toBe(false);
    expect(result.dangerFullAccessAllowed).toBe(false);
    expect(result.dashboardTriggerAllowed).toBe(false);
    expect(result.promptBodyStored).toBe(false);
    expect(result.commandBodyStored).toBe(false);
    expect(result.stdoutBodyStored).toBe(false);
    expect(result.stderrBodyStored).toBe(false);
    expect(boundaryDiagnostics.governedInputVerified).toBe(true);
    expect(boundaryDiagnostics.promptArgumentStored).toBe(false);
    expect(governedBoundaryDeferredDiagnostics.reasonCode).toBe('governed_input_missing');
    const approvalAuthority = CodexExecRealReadOnlyAdapterApprovalAuthoritySummarySchema.parse({
      id: 'codex_real_read_only_adapter_approval_authority_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'resolved',
      approvalRecordId: 'codex_approval_record_1',
      approvalArtifactId: 'codex_approval_artifact_1',
      approvalArtifactHash: 'sha256:approval',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionHash: 'sha256:policy',
      expectedDryRunPlanHash: 'sha256:dry-run',
      expectedPolicyDecisionHash: 'sha256:policy',
      dryRunHashMatched: true,
      policyHashMatched: true,
      checkedAt: createdAt,
      expiresAt: '2026-05-01T00:00:00.000Z',
      reasonCodes: [],
      summary: 'Approval authority summary stores metadata and hashes only.',
      ...flagFields,
    });
    const approvalAuthorityTrace =
      CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecordSchema.parse({
        id: 'codex_real_read_only_adapter_approval_authority_trace_1',
        schemaVersion,
        createdAt,
        dryRunId: request.dryRunId,
        status: 'aligned',
        sourcePreparationApprovalArtifactId: 'codex_approval_artifact_1',
        prerequisiteApprovalArtifactId: 'codex_approval_artifact_1',
        inputApprovalArtifactId: 'codex_approval_artifact_1',
        resolvedApprovalRecordId: 'codex_approval_record_1',
        resolvedApprovalArtifactId: 'codex_approval_artifact_1',
        approvalArtifactHash: 'sha256:approval',
        dryRunPlanHash: 'sha256:dry-run',
        policyDecisionHash: 'sha256:policy',
        expectedDryRunPlanHash: 'sha256:dry-run',
        expectedPolicyDecisionHash: 'sha256:policy',
        exactLookupMatched: true,
        sourcePreparationMatched: true,
        prerequisiteMatched: true,
        approvalApproved: true,
        approvalUnused: true,
        approvalNotRevoked: true,
        approvalNotExpired: true,
        dryRunHashMatched: true,
        policyHashMatched: true,
        attemptPreflightWouldAccept: true,
        checkedAt: createdAt,
        expiresAt: '2026-05-01T00:00:00.000Z',
        reasonCodes: [],
        degraded: false,
        notPersisted: false,
        fallbackUsedAsAuthority: false,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        evidenceRefs: [],
        auditEventIds: [],
        summary: 'Approval authority trace aligns source-prep, prerequisite, and attempt ids.',
        ...flagFields,
      });
    const approvalAuthorityTraceSummary =
      CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummarySchema.parse({
        id: 'codex_real_read_only_adapter_approval_authority_trace_summary_1',
        schemaVersion,
        createdAt,
        recordId: approvalAuthorityTrace.id,
        dryRunId: approvalAuthorityTrace.dryRunId,
        status: approvalAuthorityTrace.status,
        inputApprovalArtifactId: approvalAuthorityTrace.inputApprovalArtifactId,
        resolvedApprovalRecordId: approvalAuthorityTrace.resolvedApprovalRecordId,
        resolvedApprovalArtifactId: approvalAuthorityTrace.resolvedApprovalArtifactId,
        sourcePreparationMatched: true,
        prerequisiteMatched: true,
        exactLookupMatched: true,
        dryRunHashMatched: true,
        policyHashMatched: true,
        attemptPreflightWouldAccept: true,
        checkedAt: createdAt,
        expiresAt: approvalAuthorityTrace.expiresAt,
        reasonCodes: [],
        degraded: false,
        notPersisted: false,
        fallbackUsedAsAuthority: false,
        pilotExecuted: false,
        adapterAttemptInvoked: false,
        summary: approvalAuthorityTrace.summary,
        ...flagFields,
      });
    const approvalAuthorityTraceQuery =
      CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuerySchema.parse({
        id: 'codex_real_read_only_adapter_approval_authority_trace_query_1',
        schemaVersion,
        createdAt,
        dryRunId: request.dryRunId,
        status: 'aligned',
        limit: 10,
        ...flagFields,
      });
    const postRunSkipReason =
      CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema.parse(
        'attempt_not_completed',
      );
    const boundaryDeferredDiagnostics =
      CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema.parse({
        id: 'codex_real_read_only_adapter_boundary_deferred_diagnostics_1',
        schemaVersion,
        createdAt,
        reasonCode: 'executable_resolution_blocked',
        reasonCodes: ['executable_resolution_blocked'],
        preflightStatus: 'passed',
        runtimeWorktreeProvided: true,
        approvalInputProvided: true,
        executableResolutionStatus: 'blocked',
        executableResolutionReasonCode: 'executable_inaccessible',
        cwdSelfCheckStatus: 'passed',
        sourcePreparationReady: true,
        prerequisiteReady: true,
        worktreePathHashMatched: true,
        processBoundaryReady: false,
        summary: 'Boundary deferred diagnostics store reason codes only.',
        ...flagFields,
      });
    const attemptRecord = CodexExecRealReadOnlyAdapterAttemptRecordSchema.parse({
      id: 'codex_real_read_only_adapter_attempt_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      preflightId: preflight.id,
      resultId: result.id,
      status: 'blocked',
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      processBoundaryInvoked: false,
      preflightStatus: preflight.status,
      resultStatus: result.status,
      resultErrorCode: error.code,
      failedCheckCodes: [],
      blockedCheckCodes: [],
      boundaryDeferredReasonCode: boundaryDeferredDiagnostics.reasonCode,
      boundaryDeferredReasonCodes: boundaryDeferredDiagnostics.reasonCodes,
      boundaryDeferredDiagnostics,
      boundaryDiagnostics,
      boundaryDiagnosticsComplete: false,
      boundaryDiagnosticsMissingFields: [],
      postRunVerificationStatus: 'not_required',
      workspaceMutationDetected: false,
      evidenceSummary,
      auditSummary,
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      outputHashCount: 0,
      metadataHash: 'sha256:attempt',
      summary: 'Authoritative blocked attempt record stores metadata only.',
      ...flagFields,
    });
    const failedBoundaryAttemptRecord = CodexExecRealReadOnlyAdapterAttemptRecordSchema.parse({
      ...attemptRecord,
      id: 'codex_real_read_only_adapter_attempt_failed_boundary',
      status: 'failed',
      resultStatus: 'failed',
      resultErrorCode: 'boundary_failed',
      processBoundaryInvoked: true,
      processBoundaryModuleRef: 'packages/codex-kernel/src/real-read-only-adapter-process.ts',
      boundaryDiagnostics,
      boundaryDiagnosticsComplete: true,
      boundaryDiagnosticsMissingFields: [],
      postRunVerificationStatus: 'skipped',
      postRunVerificationSkipReason: postRunSkipReason,
      outputHashCount: 2,
      metadataHash: 'sha256:failed-boundary-attempt',
      summary: 'Failed boundary attempt record keeps diagnostics metadata only.',
    });
    const attemptSummary = CodexExecRealReadOnlyAdapterAttemptSummarySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_summary_1',
      schemaVersion,
      createdAt,
      attemptId: attemptRecord.id,
      dryRunId: request.dryRunId,
      status: attemptRecord.status,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      processBoundaryInvoked: false,
      preflightStatus: attemptRecord.preflightStatus,
      resultStatus: attemptRecord.resultStatus,
      resultErrorCode: attemptRecord.resultErrorCode,
      failedCheckCodes: attemptRecord.failedCheckCodes,
      blockedCheckCodes: attemptRecord.blockedCheckCodes,
      boundaryDeferredReasonCode: attemptRecord.boundaryDeferredReasonCode,
      boundaryDeferredReasonCodes: attemptRecord.boundaryDeferredReasonCodes,
      boundaryDeferredDiagnostics: attemptRecord.boundaryDeferredDiagnostics,
      boundaryDiagnostics: attemptRecord.boundaryDiagnostics,
      boundaryDiagnosticsComplete: attemptRecord.boundaryDiagnosticsComplete,
      boundaryDiagnosticsMissingFields: attemptRecord.boundaryDiagnosticsMissingFields,
      postRunVerificationStatus: attemptRecord.postRunVerificationStatus,
      postRunVerificationSkipReason: attemptRecord.postRunVerificationSkipReason,
      workspaceMutationDetected: attemptRecord.workspaceMutationDetected,
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      metadataHash: attemptRecord.metadataHash,
      summary: 'Attempt summary is metadata only.',
      ...flagFields,
    });
    const attemptQuery = CodexExecRealReadOnlyAdapterAttemptQuerySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_query_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });
    const attemptTimelineEntry = CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_entry_1',
      schemaVersion,
      createdAt,
      attemptId: attemptRecord.id,
      dryRunId: request.dryRunId,
      status: attemptRecord.status,
      occurredAt: createdAt,
      processBoundaryInvoked: false,
      preflightStatus: attemptRecord.preflightStatus,
      resultStatus: attemptRecord.resultStatus,
      resultErrorCode: attemptRecord.resultErrorCode,
      failedCheckCodes: attemptRecord.failedCheckCodes,
      blockedCheckCodes: attemptRecord.blockedCheckCodes,
      boundaryDeferredReasonCode: attemptRecord.boundaryDeferredReasonCode,
      boundaryDeferredReasonCodes: attemptRecord.boundaryDeferredReasonCodes,
      boundaryDeferredDiagnostics: attemptRecord.boundaryDeferredDiagnostics,
      boundaryDiagnostics: attemptRecord.boundaryDiagnostics,
      boundaryDiagnosticsComplete: attemptRecord.boundaryDiagnosticsComplete,
      boundaryDiagnosticsMissingFields: attemptRecord.boundaryDiagnosticsMissingFields,
      postRunVerificationStatus: attemptRecord.postRunVerificationStatus,
      postRunVerificationSkipReason: attemptRecord.postRunVerificationSkipReason,
      workspaceMutationDetected: attemptRecord.workspaceMutationDetected,
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      metadataHash: attemptRecord.metadataHash,
      summary: 'Timeline entry is read-only metadata only.',
      ...flagFields,
    });
    const attemptTimelineSummary = CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      entries: [attemptTimelineEntry],
      eventCount: 1,
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      processBoundaryInvokedCount: 0,
      includeEvidence: true,
      includeAudit: true,
      verificationSummary: 'Post-run verification is represented as metadata only.',
      workspaceMutationSummary: 'Workspace mutation remains forbidden.',
      recommendation: 'Timeline evidence is informational only.',
      summary: 'Attempt timeline stores counts, refs, hashes, and status only.',
      ...flagFields,
    });
    const attemptTimelineQuery = CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_query_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      includeEvidence: true,
      includeAudit: true,
      limit: 10,
      ...flagFields,
    });

    expect(attemptRecord.status).toBe('blocked');
    expect(attemptRecord.executionDisabled).toBe(true);
    expect(attemptRecord.implementationApproved).toBe(false);
    expect(attemptRecord.processAdapterApproved).toBe(false);
    expect(attemptRecord.recommendationGrantsExecution).toBe(false);
    expect(attemptRecord.workspaceWriteAllowed).toBe(false);
    expect(attemptRecord.dangerFullAccessAllowed).toBe(false);
    expect(attemptRecord.dashboardTriggerAllowed).toBe(false);
    expect(attemptRecord.preflightStatus).toBe('passed');
    expect(attemptRecord.resultStatus).toBe('blocked');
    expect(attemptRecord.resultErrorCode).toBe('boundary_deferred');
    expect(attemptRecord.boundaryDeferredReasonCode).toBe('executable_resolution_blocked');
    expect(attemptRecord.boundaryDeferredDiagnostics?.executableResolutionStatus).toBe(
      'blocked',
    );
    expect(attemptSummary.boundaryDeferredReasonCode).toBe('executable_resolution_blocked');
    expect(attemptTimelineEntry.boundaryDeferredReasonCodes).toEqual([
      'executable_resolution_blocked',
    ]);
    expect(attemptRecord.failedCheckCodes).toHaveLength(0);
    expect(attemptRecord.boundaryDiagnostics?.failureCode).toBe('process_exit_nonzero');
    expect(attemptRecord.boundaryDiagnostics?.stdoutHash).toBe('sha256:stdout');
    expect(attemptRecord.boundaryDiagnostics?.stderrHash).toBe('sha256:stderr');
    expect(attemptRecord.postRunVerificationStatus).toBe('not_required');
    expect(failedBoundaryAttemptRecord.processBoundaryInvoked).toBe(true);
    expect(failedBoundaryAttemptRecord.postRunVerificationStatus).toBe('skipped');
    expect(failedBoundaryAttemptRecord.postRunVerificationSkipReason).toBe(
      'attempt_not_completed',
    );
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.failureCode).toBe(
      'process_exit_nonzero',
    );
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.startFailureKind).toBe('none');
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.resolvedExecutableKind).toBe(
      'native_exe',
    );
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.cwdHash).toBe('sha256:cwd');
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.executableAccessible).toBe(true);
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.envAllowlistKeyHash).toBe(
      'sha256:env-keys',
    );
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.nonzeroExitKind).toBe(
      'codex_cli_usage_error_suspected',
    );
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.stdoutByteLength).toBe(12);
    expect(failedBoundaryAttemptRecord.boundaryDiagnostics?.stderrByteLength).toBe(14);
    expect(failedBoundaryAttemptRecord.boundaryDiagnosticsComplete).toBe(true);
    expect(failedBoundaryAttemptRecord.boundaryDiagnosticsMissingFields).toEqual([]);
    expect(attemptRecord.workspaceMutationDetected).toBe(false);
    expect(attemptRecord.promptBodyStored).toBe(false);
    expect(attemptRecord.commandBodyStored).toBe(false);
    expect(attemptRecord.stdoutBodyStored).toBe(false);
    expect(attemptRecord.stderrBodyStored).toBe(false);
    expect(approvalAuthority.status).toBe('resolved');
    expect(approvalAuthorityTrace.status).toBe('aligned');
    expect(approvalAuthorityTraceSummary.attemptPreflightWouldAccept).toBe(true);
    expect(approvalAuthorityTraceQuery.status).toBe('aligned');
    expect(JSON.stringify(approvalAuthority)).not.toContain('raw prompt body');
    expect(JSON.stringify(approvalAuthorityTrace)).not.toContain('raw stdout body');
    expect(JSON.stringify(approvalAuthority)).not.toContain('raw stdout body');
    expect(JSON.stringify(approvalAuthority)).not.toContain('"argv"');
    expect(JSON.stringify(approvalAuthority)).not.toContain('"executablePath":');
    expect(JSON.stringify(failedBoundaryAttemptRecord)).not.toContain('raw stdout body');
    expect(JSON.stringify(failedBoundaryAttemptRecord)).not.toContain('raw stderr body');
    expect(JSON.stringify(failedBoundaryAttemptRecord)).not.toContain('"argv"');
    expect(JSON.stringify(failedBoundaryAttemptRecord)).not.toContain('"executablePath":');
    expect(attemptRecord.degraded).toBe(false);
    expect(attemptRecord.notPersisted).toBe(false);
    expect(attemptSummary.attemptId).toBe(attemptRecord.id);
    expect(attemptSummary.boundaryDiagnosticsComplete).toBe(false);
    expect(attemptSummary.boundaryDiagnosticsMissingFields).toEqual([]);
    expect(attemptQuery.status).toBe('blocked');
    expect(attemptTimelineEntry.attemptId).toBe(attemptRecord.id);
    expect(attemptTimelineEntry.boundaryDiagnosticsComplete).toBe(false);
    expect(attemptTimelineEntry.boundaryDiagnosticsMissingFields).toEqual([]);
    expect(attemptTimelineSummary.eventCount).toBe(1);
    expect(attemptTimelineSummary.implementationApproved).toBe(false);
    expect(attemptTimelineSummary.processAdapterApproved).toBe(false);
    expect(attemptTimelineSummary.recommendationGrantsExecution).toBe(false);
    expect(attemptTimelineSummary.workspaceWriteAllowed).toBe(false);
    expect(attemptTimelineSummary.dangerFullAccessAllowed).toBe(false);
    expect(attemptTimelineSummary.dashboardTriggerAllowed).toBe(false);
    expect(attemptTimelineQuery.includeEvidence).toBe(true);
    expect(JSON.stringify(attemptRecord)).not.toContain('raw prompt body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw command body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw stdout body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw stderr body');
    expect(JSON.stringify(attemptRecord)).not.toContain('diagnostic stdout body');
    expect(JSON.stringify(attemptRecord)).not.toContain('diagnostic stderr body');
    expect(JSON.stringify(attemptRecord)).not.toContain('argv');
    expect(JSON.stringify(attemptRecord)).not.toContain('executablePath');
    expect(JSON.stringify(attemptRecord)).not.toContain('shellSnippet');
    expect(JSON.stringify(attemptRecord)).not.toContain('envPlan');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw prompt body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw command body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw stdout body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw stderr body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('argv');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('executablePath');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('shellSnippet');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('envPlan');
    expect('command' in boundaryPlan).toBe(false);
    expect('argv' in boundaryPlan).toBe(false);
    expect('executablePath' in boundaryPlan).toBe(false);
    expect('shellSnippet' in boundaryPlan).toBe(false);
    expect('envPlan' in boundaryPlan).toBe(false);
    expect(JSON.stringify(result)).not.toContain('raw prompt body');
    expect(JSON.stringify(result)).not.toContain('raw command body');
    expect(JSON.stringify(result)).not.toContain('raw stdout body');
    expect(JSON.stringify(result)).not.toContain('raw stderr body');

    expect(() =>
      CodexExecRealReadOnlyAdapterRequestSchema.parse({
        ...request,
        id: 'codex_real_read_only_adapter_request_invalid_sandbox',
        requestedSandboxMode: 'workspace_write',
      }),
    ).toThrow();
    expect(() =>
      CodexExecRealReadOnlyAdapterConfigSchema.parse({
        ...config,
        id: 'codex_real_read_only_adapter_config_invalid_dashboard_trigger',
        dashboardTriggerAllowed: true,
      }),
    ).toThrow();
    expect(() =>
      CodexExecRealReadOnlyAdapterRequestSchema.parse({
        ...request,
        id: 'codex_real_read_only_adapter_request_invalid_danger',
        dangerFullAccessAllowed: true,
      }),
    ).toThrow();
  });

  it('parses real read-only adapter policy source models and blocks degraded aligned states', () => {
    const createdAt = '2026-04-30T00:00:00.000Z';
    const flagFields = {
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      processAdapterApproved: false,
      implementationApproved: false,
      recommendationGrantsExecution: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterPolicySourceGateSchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_gate_1',
      schemaVersion,
      createdAt,
      code: 'policy_decision_allows_pilot',
      label: 'Policy decision allows guarded pilot route',
      category: 'policy',
      status: 'passed',
      required: true,
      summary: 'Current policy decision is non-deny.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterPolicySourceBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_blocker_1',
      schemaVersion,
      createdAt,
      code: 'policy_source_persisted_authoritative',
      severity: 'critical',
      relatedGateCode: 'policy_source_persisted_authoritative',
      summary: 'Policy source must be persisted.',
      recommendation: 'Prepare a Supervisor-backed policy source.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterPolicySourceFindingSchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_finding_1',
      schemaVersion,
      createdAt,
      code: 'policy_review_note',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Policy source needs operator review.',
      recommendation: 'Review before pilot retry.',
      ...flagFields,
    });
    const checklistItem = CodexExecRealReadOnlyAdapterPolicySourceChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_check_1',
      schemaVersion,
      createdAt,
      code: gate.code,
      label: gate.label,
      status: gate.status,
      required: true,
      summary: gate.summary,
      ...flagFields,
    });
    const record = CodexExecRealReadOnlyAdapterPolicySourceRecordSchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'aligned',
      recommendation: 'Policy source is aligned for future approval binding only.',
      gates: [gate],
      blockers: [],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 1,
      blockedGateCount: 0,
      requiresReviewFindingCount: 1,
      missingSources: [],
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: true,
      configExplicitlyEnabled: true,
      readOnlyOnly: true,
      policyDecisionPresent: true,
      policyDecisionAllowsPilot: true,
      policyDecisionId: 'policy_decision_1',
      policyDecisionHash: 'sha256:policy',
      policyDecisionOutcome: 'approval_required',
      policyDecisionReasonCount: 1,
      dryRunPlanHash: 'sha256:dry-run',
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      evidenceRefs: [],
      auditEventIds: ['audit_policy_source_1'],
      summary: 'Policy source stores ids, hashes, counts, and refs only.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterPolicySourceSummarySchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_summary_1',
      schemaVersion,
      createdAt,
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      dryRunRecordPresent: record.dryRunRecordPresent,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      readOnlyOnly: record.readOnlyOnly,
      policyDecisionPresent: record.policyDecisionPresent,
      policyDecisionAllowsPilot: record.policyDecisionAllowsPilot,
      policyDecisionId: record.policyDecisionId,
      policyDecisionHash: record.policyDecisionHash,
      policyDecisionOutcome: record.policyDecisionOutcome,
      dryRunPlanHash: record.dryRunPlanHash,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      recommendation: record.recommendation,
      summary: 'Policy source summary stores metadata only.',
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterPolicySourceQuerySchema.parse({
      id: 'codex_real_read_only_adapter_policy_source_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'aligned',
      limit: 10,
      ...flagFields,
    });

    expect(record.status).toBe('aligned');
    expect(summary.status).toBe('aligned');
    expect(query.status).toBe('aligned');
    expect(blocker.code).toBe('policy_source_persisted_authoritative');
    expect(JSON.stringify(record)).not.toContain('raw prompt body');
    expect(JSON.stringify(record)).not.toContain('raw command body');
    expect(JSON.stringify(record)).not.toContain('"argv"');
    expect(JSON.stringify(record)).not.toContain('"executablePath":');
    expect(() =>
      CodexExecRealReadOnlyAdapterPolicySourceRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_policy_source_invalid_aligned',
        status: 'aligned',
        degraded: true,
      }),
    ).toThrow();
  });

  it('parses pilot prerequisite readiness models and blocks degraded ready states', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_gate_1',
      schemaVersion,
      createdAt,
      code: 'authoritative_attempt_evidence',
      label: 'Authoritative attempt evidence',
      category: 'authority',
      status: 'blocked',
      required: true,
      summary: 'Persisted Supervisor-backed attempt evidence is required.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_blocker_1',
      schemaVersion,
      createdAt,
      code: 'missing_authoritative_attempt_evidence',
      severity: 'high',
      relatedGateCode: gate.code,
      summary: 'No persisted authoritative attempt evidence is available.',
      recommendation: 'Create authoritative attempt evidence before pilot retry.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_finding_1',
      schemaVersion,
      createdAt,
      code: 'handoff_context_incomplete',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Handoff context is incomplete.',
      recommendation: 'Record operator handoff context before pilot retry.',
      ...flagFields,
    });
    const checklistItem = CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_check_1',
      schemaVersion,
      createdAt,
      code: 'config_explicitly_enabled',
      label: 'Config explicitly enabled',
      status: 'blocked',
      required: true,
      summary: 'Config is inspected only and remains disabled.',
      ...flagFields,
    });
    const record = CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'blocked',
      recommendation: 'Pilot retry remains blocked until hard prerequisites are present.',
      gates: [gate],
      blockers: [blocker],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 0,
      blockedGateCount: 1,
      requiresReviewFindingCount: 1,
      missingPrerequisites: ['authoritative_attempt_evidence'],
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: true,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      worktreeLabel: 'operator-provided-isolated-worktree',
      worktreeStatus: 'missing',
      worktreePathHash: 'sha256:worktree-path',
      evidenceRefs: [],
      auditEventIds: ['audit_pilot_prerequisite_1'],
      summary: 'Pilot prerequisite record stores status, counts, hashes, and refs only.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_summary_1',
      schemaVersion,
      createdAt,
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingPrerequisites: record.missingPrerequisites,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      dryRunRecordPresent: record.dryRunRecordPresent,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      authoritativeSourcePreparationPresent: record.authoritativeSourcePreparationPresent,
      authoritativeAttemptEvidencePresent: record.authoritativeAttemptEvidencePresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      recommendation: record.recommendation,
      summary: 'Pilot prerequisite summary stores metadata only.',
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });

    expect(record.status).toBe('blocked');
    expect(record.pilotExecuted).toBe(false);
    expect(record.adapterAttemptInvoked).toBe(false);
    expect(record.fallbackUsedAsAuthority).toBe(false);
    expect(summary.status).toBe('blocked');
    expect(query.status).toBe('blocked');
    expect(JSON.stringify(record)).not.toContain('C:/');
    expect(JSON.stringify(record)).not.toContain('raw prompt body');
    expect(JSON.stringify(record)).not.toContain('raw command body');
    expect(JSON.stringify(record)).not.toContain('raw stdout body');
    expect(JSON.stringify(record)).not.toContain('raw stderr body');
    expect(JSON.stringify(record)).not.toContain('"argv"');
    expect(JSON.stringify(record)).not.toContain('"executablePath":');
    expect(() =>
      CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_pilot_prerequisite_invalid_ready',
        status: 'ready_for_pilot_retry',
        degraded: true,
      }),
    ).toThrow();
  });

  it('parses pilot prerequisite source preparation models and blocks degraded prepared states', () => {
    const createdAt = '2026-04-30T00:00:00.000Z';
    const flagFields = {
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      processAdapterApproved: false,
      implementationApproved: false,
      recommendationGrantsExecution: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_gate_1',
      schemaVersion,
      createdAt,
      code: 'isolated_clean_worktree_metadata',
      label: 'Isolated clean worktree metadata',
      category: 'worktree',
      status: 'blocked',
      required: true,
      summary: 'Existing isolated worktree metadata is required.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_blocker_1',
      schemaVersion,
      createdAt,
      code: gate.code,
      severity: 'high',
      relatedGateCode: gate.code,
      summary: 'No isolated clean worktree metadata is present.',
      recommendation: 'Record worktree label/hash/status before 4F.2.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_finding_1',
      schemaVersion,
      createdAt,
      code: 'handoff_context_incomplete',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Operator handoff context needs review.',
      recommendation: 'Record handoff context before 4F.2.',
      ...flagFields,
    });
    const checklistItem =
      CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema.parse({
        id: 'codex_real_read_only_adapter_pilot_source_preparation_check_1',
        schemaVersion,
        createdAt,
        code: gate.code,
        label: gate.label,
        status: gate.status,
        required: true,
        summary: gate.summary,
        ...flagFields,
      });
    const record = CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'blocked',
      recommendation: 'Source preparation remains blocked.',
      gates: [gate],
      blockers: [blocker],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 0,
      blockedGateCount: 1,
      requiresReviewFindingCount: 1,
      missingSources: ['isolated_clean_worktree_metadata'],
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: true,
      configExplicitlyEnabled: true,
      authoritativePolicySourcePresent: true,
      validUnusedApprovalPresent: true,
      approvalArtifactId: 'codex_approval_artifact_1',
      approvalArtifactHash: 'sha256:approval',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionHash: 'sha256:policy',
      isolatedCleanWorktreeMetadataPresent: false,
      worktreeLabel: 'operator-isolated-worktree',
      worktreeStatus: 'missing',
      worktreePathHash: 'sha256:worktree',
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      evidenceRefs: [],
      auditEventIds: ['audit_source_preparation_1'],
      summary: 'Source preparation stores metadata only.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_summary_1',
      schemaVersion,
      createdAt,
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      dryRunRecordPresent: record.dryRunRecordPresent,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      recommendation: record.recommendation,
      summary: 'Source preparation summary stores metadata only.',
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });

    expect(record.status).toBe('blocked');
    expect(summary.status).toBe('blocked');
    expect(query.status).toBe('blocked');
    expect(record.pilotExecuted).toBe(false);
    expect(record.adapterAttemptInvoked).toBe(false);
    expect(JSON.stringify(record)).not.toContain('C:/');
    expect(JSON.stringify(record)).not.toContain('raw prompt body');
    expect(JSON.stringify(record)).not.toContain('"argv"');
    expect(JSON.stringify(record)).not.toContain('"executablePath":');
    expect(() =>
      CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_pilot_source_preparation_invalid_prepared',
        status: 'prepared',
        degraded: true,
      }),
    ).toThrow();
  });
});

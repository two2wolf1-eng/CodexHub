import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  type AuditEvent,
  type BrowserObservationApprovalArtifactRecord,
  type BrowserObservationControlPlaneRun,
  type BrowserObservationDryRunRecord,
  type CodexExecLiveAdapterAdrDecisionRecord,
  type CodexExecLiveRunRecord,
  type CodexExecManualApprovalRecord,
  type CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  type CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  type CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  type CodexExecRealReadOnlyAdapterReadinessPackage,
  type CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  type CodexExecRealReadOnlyAdapterAttemptRecord,
  type CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  type CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  type CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  type CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  type CodexExecReportReviewRecord,
  type CodexReplayRecord,
  type CustomWorkflowApprovalArtifactRecord,
  type CustomWorkflowPlan,
  type CustomWorkflowRun,
  type ProductionWorkflowChildActionStateRecord,
  type ProductionWorkflowRecoveryApprovalArtifact,
  type ProductionWorkflowRecoveryPlan,
  type ProductionWorkflowRecoveryRun,
  type ElectronCdpObservationApprovalArtifactRecord,
  type ElectronCdpObservationControlPlaneRun,
  type ElectronCdpObservationDryRunRecord,
  type EvidenceRef,
  type GithubBranchPublishApprovalArtifactRecord,
  type GithubCommitContentManifest,
  type GithubBranchPublishPlan,
  type GithubBranchPublishRun,
  type GithubDraftPrApprovalArtifactRecord,
  type GithubDraftPrPlan,
  type GithubDraftPrRun,
  type GithubPublishDraftPrChainPlan,
  type GithubPublishDraftPrChainRun,
  type GithubPublishDraftPrChainStep,
  type GithubRemoteCommitSummary,
  type GithubRemotePrLifecycleSummary,
  type GithubRemoteRefSummary,
  type MockDevelopmentRun,
  type WorktreeApprovalArtifactRecord,
  type WorktreeCleanupApprovalArtifactRecord,
  type WorktreeCleanupControlPlaneRun,
  type WorktreeCleanupDryRunRecord,
  type WorktreeControlPlaneRun,
  type WorktreeDryRunRecord,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { createSqliteStore, resolveCodexHubDbPath } from './index';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';

describe('store-sqlite migration initialization', () => {
  it('creates an idempotent temp file database and repositories', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');

    const first = await createSqliteStore({ dbPath });
    await first.workflowRuns.create({
      id: 'run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:00.000Z',
      workflowName: 'development.bootstrap',
      status: 'created',
      dryRun: true,
      steps: [],
      evidenceRefs: [],
    });
    const mockDevelopmentRun: MockDevelopmentRun = {
      id: 'development_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:01.000Z',
      request: {
        id: 'development_request_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        title: 'Add Electron CDP read-only observation skeleton',
        description: 'Create interfaces and tests only',
        constraints: [],
      },
      taskGraph: {
        id: 'task_graph_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        requestId: 'development_request_1',
        tasks: [],
      },
      skillResolution: {
        id: 'skill_resolution_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        inputSummary: 'mock skill resolution',
        selectedSkills: [],
        unmatchedCapabilities: [],
        reasons: [],
      },
      agentRuns: [],
      verificationRun: {
        id: 'verification_run_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        targetId: 'task_graph_1',
        status: 'passed',
        checks: [],
        evidenceRefs: [],
      },
      evidenceRefs: [],
      auditEvents: [],
      summary: {
        requestTitle: 'Add Electron CDP read-only observation skeleton',
        taskCount: 0,
        selectedSkillIds: [],
        agentRunCount: 0,
        verificationStatus: 'passed',
        evidenceCount: 0,
        auditEventCount: 0,
        orchestrationPlanId: 'orchestration_plan_1',
        mockOnly: true,
      },
    };
    await first.developmentRuns.saveMockDevelopmentRun(mockDevelopmentRun);
    const codexReplay: CodexReplayRecord = {
      id: 'codex_replay_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:02.000Z',
      sourceKind: 'fixture',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      threadId: 'thread_fixture_basic',
      status: 'completed',
      summary: 'Fixture replay completed: 10 events, 0 errors',
      replayHash: 'sha256:replay',
      eventCount: 10,
      itemCount: 7,
      commandExecutionCount: 1,
      fileChangeCount: 1,
      mcpToolCallCount: 1,
      webSearchCount: 1,
      errorCount: 0,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      evidenceRefs: [],
      auditEventIds: ['audit_1', 'audit_2'],
      storageMetadata: {
        sourceKind: 'fixture',
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixturePathHash: 'sha256:path',
        replayHash: 'sha256:replay',
        bodyStored: false,
        normalizedEventsStored: false,
        eventHashCount: 10,
        mockOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    };
    await first.codexReplays.saveCodexReplay(codexReplay);
    const codexExecLiveRun: CodexExecLiveRunRecord = createCodexExecLiveRunFixture();
    await first.codexExecLiveRuns.saveCodexExecLiveRunRecord(codexExecLiveRun);
    const evidenceRef: EvidenceRef = {
      id: 'evidence_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:03.000Z',
      kind: 'codex.exec.dry_run_plan',
      hash: 'sha256:evidence',
      summary: 'Evidence summary only',
      labels: ['codex.dry_run_plan'],
      redacted: true,
      metadata: {
        dryRunPlanId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
      },
    };
    const auditEvent: AuditEvent = {
      id: 'audit_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:03.000Z',
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.policy_evaluated',
      outcome: 'deny',
      evidenceRefs: [evidenceRef],
      policyDecisionId: 'policy_1',
      metadata: {
        dryRunPlanId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
      },
    };
    await first.evidenceRefs.create(evidenceRef);
    await first.auditEvents.append(auditEvent);
    const approvalRecord: CodexExecManualApprovalRecord = createCodexExecApprovalRecordFixture();
    await first.codexExecApprovals.saveCodexExecApprovalRecord(approvalRecord);
    const browserDryRun = createBrowserObservationDryRunFixture();
    await first.browserObservationDryRuns.saveDryRun(browserDryRun);
    const browserApproval = createBrowserObservationApprovalFixture();
    await first.browserObservationApprovals.saveApproval(browserApproval);
    const browserRun = createBrowserObservationRunFixture();
    await first.browserObservationRuns.saveRun(browserRun);
    const electronDryRun = createElectronCdpObservationDryRunFixture();
    await first.electronCdpObservationDryRuns.saveDryRun(electronDryRun);
    const electronApproval = createElectronCdpObservationApprovalFixture();
    await first.electronCdpObservationApprovals.saveApproval(electronApproval);
    const electronRun = createElectronCdpObservationRunFixture();
    await first.electronCdpObservationRuns.saveRun(electronRun);
    const worktreeDryRun = createWorktreeDryRunFixture();
    await first.worktreeDryRuns.saveDryRun(worktreeDryRun);
    const worktreeApproval = createWorktreeApprovalFixture();
    await first.worktreeApprovals.saveApproval(worktreeApproval);
    const worktreeRun = createWorktreeRunFixture();
    await first.worktreeRuns.saveRun(worktreeRun);
    const worktreeCleanupDryRun = createWorktreeCleanupDryRunFixture();
    await first.worktreeCleanupDryRuns.saveDryRun(worktreeCleanupDryRun);
    const worktreeCleanupApproval = createWorktreeCleanupApprovalFixture();
    await first.worktreeCleanupApprovals.saveApproval(worktreeCleanupApproval);
    const worktreeCleanupRun = createWorktreeCleanupRunFixture();
    await first.worktreeCleanupRuns.saveRun(worktreeCleanupRun);
    const customWorkflowDryRun = createCustomWorkflowPlanFixture();
    await first.customWorkflowDryRuns.saveDryRun(customWorkflowDryRun);
    const customWorkflowApproval = createCustomWorkflowApprovalFixture();
    await first.customWorkflowApprovals.saveApproval(customWorkflowApproval);
    const customWorkflowRun = createCustomWorkflowRunFixture();
    await first.customWorkflowRuns.saveRun(customWorkflowRun);
    const recoveryDryRun = createProductionWorkflowRecoveryPlanFixture();
    await first.productionWorkflowRecoveryDryRuns.saveDryRun(recoveryDryRun);
    const recoveryApproval = createProductionWorkflowRecoveryApprovalFixture();
    await first.productionWorkflowRecoveryApprovals.saveApproval(recoveryApproval);
    const recoveryRun = createProductionWorkflowRecoveryRunFixture();
    await first.productionWorkflowRecoveryRuns.saveRun(recoveryRun);
    const recoveryChildState = createProductionWorkflowRecoveryChildActionStateFixture();
    await first.productionWorkflowRecoveryChildActionStates.saveChildActionState(recoveryChildState);
    const reportReview: CodexExecReportReviewRecord = createCodexReportReviewFixture();
    await first.codexReportReviews.saveReportReview(reportReview);
    const adrDecision: CodexExecLiveAdapterAdrDecisionRecord =
      createCodexExecLiveAdapterAdrDecisionFixture();
    await first.codexExecLiveAdapterAdrDecisions.saveDecision(adrDecision);
    const simulatorReview: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord =
      createReadOnlyAdapterSimulatorReviewFixture();
    await first.codexExecReadOnlyAdapterSimulatorReviews.saveSimulatorReview(simulatorReview);
    const implementationPlanReview: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord =
      createReadOnlyAdapterImplementationPlanReviewFixture();
    await first.codexExecReadOnlyAdapterImplementationPlanReviews.saveImplementationPlanReview(
      implementationPlanReview,
    );
    const skeletonReview: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord =
      createReadOnlyAdapterSkeletonReviewFixture();
    await first.codexExecReadOnlyAdapterSkeletonReviews.saveSkeletonReview(skeletonReview);
    const finalReadiness: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord =
      createReadOnlyAdapterFinalReadinessFixture();
    await first.codexExecReadOnlyAdapterFinalReadiness.saveFinalReadiness(finalReadiness);
    const realReadOnlyAdapterReadiness: CodexExecRealReadOnlyAdapterReadinessPackage =
      createRealReadOnlyAdapterReadinessFixture();
    await first.codexExecRealReadOnlyAdapterReadiness.saveReadinessPackage(
      realReadOnlyAdapterReadiness,
    );
    const realReadOnlyAdapterReadinessReview: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord =
      createRealReadOnlyAdapterReadinessReviewFixture();
    await first.codexExecRealReadOnlyAdapterReadinessReviews.saveReadinessReview(
      realReadOnlyAdapterReadinessReview,
    );
    const realReadOnlyAdapterAttempt: CodexExecRealReadOnlyAdapterAttemptRecord =
      createRealReadOnlyAdapterAttemptFixture();
    await first.codexExecRealReadOnlyAdapterAttempts.saveAttempt(realReadOnlyAdapterAttempt);
    const realReadOnlyAdapterFailedAttempt: CodexExecRealReadOnlyAdapterAttemptRecord =
      createRealReadOnlyAdapterFailedAttemptFixture();
    await first.codexExecRealReadOnlyAdapterAttempts.saveAttempt(
      realReadOnlyAdapterFailedAttempt,
    );
    const realReadOnlyAdapterApprovalAuthorityTrace: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord =
      createRealReadOnlyAdapterApprovalAuthorityTraceFixture();
    await first.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.saveApprovalAuthorityTrace(
      realReadOnlyAdapterApprovalAuthorityTrace,
    );
    const realReadOnlyAdapterPilotPrerequisite: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord =
      createRealReadOnlyAdapterPilotPrerequisiteFixture();
    await first.codexExecRealReadOnlyAdapterPilotPrerequisites.savePilotPrerequisite(
      realReadOnlyAdapterPilotPrerequisite,
    );
    const realReadOnlyAdapterPilotSourcePreparation: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord =
      createRealReadOnlyAdapterPilotSourcePreparationFixture();
    await first.codexExecRealReadOnlyAdapterPilotSourcePreparations.savePilotSourcePreparation(
      realReadOnlyAdapterPilotSourcePreparation,
    );
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const runs = await second.workflowRuns.list();
    const developmentRuns = await second.developmentRuns.listMockDevelopmentRuns(10);
    const developmentRun = await second.developmentRuns.getMockDevelopmentRun('development_run_1');
    const codexReplays = await second.codexReplays.listCodexReplays(10);
    const codexReplayRecord = await second.codexReplays.getCodexReplay('codex_replay_1');
    const codexExecLiveRuns = await second.codexExecLiveRuns.listCodexExecLiveRunRecords(10);
    const codexExecLiveRunRecord =
      await second.codexExecLiveRuns.getCodexExecLiveRunRecord('codex_live_run_1');
    const evidenceRefs = await second.evidenceRefs.listEvidenceRefs({
      dryRunId: 'codex_dry_run_1',
      kind: 'codex.exec.dry_run_plan',
    });
    const evidenceRecord = await second.evidenceRefs.getEvidenceRef('evidence_1');
    const auditEvents = await second.auditEvents.listAuditEvents({
      dryRunId: 'codex_dry_run_1',
      action: 'codex.exec.policy_evaluated',
    });
    const auditRecord = await second.auditEvents.getAuditEvent('audit_1');
    const codexExecApprovals = await second.codexExecApprovals.listCodexExecApprovalRecords(10);
    const codexExecApprovalRecord =
      await second.codexExecApprovals.getCodexExecApprovalRecord('codex_approval_record_1');
    const codexExecApprovalByArtifact =
      await second.codexExecApprovals.getCodexExecApprovalRecordByArtifactId(
        'codex_approval_artifact_1',
      );
    const codexExecApprovalsForDryRun =
      await second.codexExecApprovals.listCodexExecApprovalRecordsForDryRun(
        'codex_dry_run_1',
        10,
      );
    const browserDryRuns = await second.browserObservationDryRuns.listDryRuns({
      dryRunId: 'browser_dry_run_1',
      status: 'ready',
      limit: 10,
    });
    const browserDryRunRecord =
      await second.browserObservationDryRuns.getDryRun('browser_dry_run_record_1');
    const browserApprovals = await second.browserObservationApprovals.listApprovals({
      dryRunId: 'browser_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const browserApprovalRecord =
      await second.browserObservationApprovals.getApproval('browser_approval_record_1');
    const browserApprovalByArtifact =
      await second.browserObservationApprovals.getApprovalByArtifactId('browser_approval_artifact_1');
    const browserRuns = await second.browserObservationRuns.listRuns({
      dryRunId: 'browser_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const browserRunRecord = await second.browserObservationRuns.getRun('browser_control_run_1');
    const electronDryRuns = await second.electronCdpObservationDryRuns.listDryRuns({
      dryRunId: 'electron_dry_run_1',
      status: 'ready',
      limit: 10,
    });
    const electronDryRunRecord =
      await second.electronCdpObservationDryRuns.getDryRun('electron_dry_run_record_1');
    const electronApprovals = await second.electronCdpObservationApprovals.listApprovals({
      dryRunId: 'electron_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const electronApprovalRecord =
      await second.electronCdpObservationApprovals.getApproval('electron_approval_record_1');
    const electronApprovalByArtifact =
      await second.electronCdpObservationApprovals.getApprovalByArtifactId(
        'electron_approval_artifact_1',
      );
    const electronRuns = await second.electronCdpObservationRuns.listRuns({
      dryRunId: 'electron_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const electronRunRecord =
      await second.electronCdpObservationRuns.getRun('electron_control_run_1');
    const worktreeDryRuns = await second.worktreeDryRuns.listDryRuns({
      dryRunId: 'worktree_dry_run_1',
      status: 'ready',
      limit: 10,
    });
    const worktreeDryRunRecord =
      await second.worktreeDryRuns.getDryRun('worktree_dry_run_record_1');
    const worktreeApprovals = await second.worktreeApprovals.listApprovals({
      dryRunId: 'worktree_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const worktreeApprovalRecord =
      await second.worktreeApprovals.getApproval('worktree_approval_record_1');
    const worktreeApprovalByArtifact =
      await second.worktreeApprovals.getApprovalByArtifactId('worktree_approval_artifact_1');
    const worktreeRuns = await second.worktreeRuns.listRuns({
      dryRunId: 'worktree_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const worktreeRunRecord = await second.worktreeRuns.getRun('worktree_control_run_1');
    const worktreeCleanupDryRuns = await second.worktreeCleanupDryRuns.listDryRuns({
      dryRunId: 'worktree_cleanup_dry_run_1',
      status: 'ready',
      limit: 10,
    });
    const worktreeCleanupDryRunRecord =
      await second.worktreeCleanupDryRuns.getDryRun('worktree_cleanup_dry_run_record_1');
    const worktreeCleanupApprovals = await second.worktreeCleanupApprovals.listApprovals({
      dryRunId: 'worktree_cleanup_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const worktreeCleanupApprovalRecord =
      await second.worktreeCleanupApprovals.getApproval('worktree_cleanup_approval_record_1');
    const worktreeCleanupApprovalByArtifact =
      await second.worktreeCleanupApprovals.getApprovalByArtifactId(
        'worktree_cleanup_approval_artifact_1',
      );
    const worktreeCleanupRuns = await second.worktreeCleanupRuns.listRuns({
      dryRunId: 'worktree_cleanup_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const worktreeCleanupRunRecord =
      await second.worktreeCleanupRuns.getRun('worktree_cleanup_control_run_1');
    const customWorkflowDryRuns = await second.customWorkflowDryRuns.listDryRuns({
      dryRunId: 'custom_workflow_dry_run_1',
      status: 'planned',
      limit: 10,
    });
    const customWorkflowDryRunRecord =
      await second.customWorkflowDryRuns.getDryRun('custom_workflow_plan_record_1');
    const customWorkflowApprovals = await second.customWorkflowApprovals.listApprovals({
      dryRunId: 'custom_workflow_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const customWorkflowApprovalRecord =
      await second.customWorkflowApprovals.getApproval('custom_workflow_approval_record_1');
    const customWorkflowApprovalByArtifact =
      await second.customWorkflowApprovals.getApprovalByArtifactId(
        'custom_workflow_approval_artifact_1',
      );
    const customWorkflowRuns = await second.customWorkflowRuns.listRuns({
      dryRunId: 'custom_workflow_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const customWorkflowRunRecord =
      await second.customWorkflowRuns.getRun('custom_workflow_run_1');
    const recoveryDryRuns = await second.productionWorkflowRecoveryDryRuns.listDryRuns({
      dryRunId: 'production_workflow_recovery_dry_run_1',
      status: 'planned',
      limit: 10,
    });
    const recoveryDryRunRecord =
      await second.productionWorkflowRecoveryDryRuns.getDryRun(
        'production_workflow_recovery_plan_record_1',
      );
    const recoveryApprovals = await second.productionWorkflowRecoveryApprovals.listApprovals({
      dryRunId: 'production_workflow_recovery_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const recoveryApprovalRecord =
      await second.productionWorkflowRecoveryApprovals.getApproval(
        'production_workflow_recovery_approval_record_1',
      );
    const recoveryApprovalByArtifact =
      await second.productionWorkflowRecoveryApprovals.getApprovalByArtifactId(
        'production_workflow_recovery_approval_artifact_1',
      );
    const recoveryRuns = await second.productionWorkflowRecoveryRuns.listRuns({
      dryRunId: 'production_workflow_recovery_dry_run_1',
      status: 'waiting_for_child_approval',
      limit: 10,
    });
    const recoveryRunRecord =
      await second.productionWorkflowRecoveryRuns.getRun(
        'production_workflow_recovery_run_1',
      );
    const recoveryChildStates =
      await second.productionWorkflowRecoveryChildActionStates.listChildActionStates({
        dryRunId: 'production_workflow_recovery_dry_run_1',
        status: 'waiting_for_child_approval',
        limit: 10,
      });
    const recoveryChildStateRecord =
      await second.productionWorkflowRecoveryChildActionStates.getChildActionState(
        'production_workflow_recovery_child_action_state_1',
      );
    const reportReviews = await second.codexReportReviews.listReportReviews({
      dryRunId: 'codex_dry_run_1',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      limit: 10,
    });
    const reportReviewRecord =
      await second.codexReportReviews.getReportReview('codex_report_review_1');
    const adrDecisions = await second.codexExecLiveAdapterAdrDecisions.listDecisions({
      dryRunId: 'codex_dry_run_1',
      status: 'recorded',
      decision: 'conditional_read_only_go',
      limit: 10,
    });
    const adrDecisionRecord = await second.codexExecLiveAdapterAdrDecisions.getDecision(
      'codex_live_adapter_adr_decision_1',
    );
    const simulatorReviews =
      await second.codexExecReadOnlyAdapterSimulatorReviews.listSimulatorReviews({
        dryRunId: 'codex_dry_run_1',
        status: 'recorded',
        outcome: 'go_to_implementation_planning',
        limit: 10,
      });
    const simulatorReviewRecord =
      await second.codexExecReadOnlyAdapterSimulatorReviews.getSimulatorReview(
        'codex_read_only_adapter_simulator_review_1',
      );
    const implementationPlanReviews =
      await second.codexExecReadOnlyAdapterImplementationPlanReviews.listImplementationPlanReviews({
        status: 'recorded',
        outcome: 'conditional_go_to_disabled_skeleton',
        limit: 10,
      });
    const implementationPlanReviewRecord =
      await second.codexExecReadOnlyAdapterImplementationPlanReviews.getImplementationPlanReview(
        'codex_read_only_adapter_implementation_plan_review_1',
      );
    const skeletonReviews =
      await second.codexExecReadOnlyAdapterSkeletonReviews.listSkeletonReviews({
        status: 'recorded',
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        limit: 10,
      });
    const skeletonReviewRecord =
      await second.codexExecReadOnlyAdapterSkeletonReviews.getSkeletonReview(
        'codex_read_only_adapter_skeleton_review_1',
      );
    const finalReadinessRecords =
      await second.codexExecReadOnlyAdapterFinalReadiness.listFinalReadinessRecords({
        status: 'recorded',
        outcome: 'ready_for_separate_read_only_adapter_adr',
        limit: 10,
      });
    const finalReadinessRecord =
      await second.codexExecReadOnlyAdapterFinalReadiness.getFinalReadiness(
        'codex_read_only_adapter_final_readiness_1',
      );
    const realReadOnlyAdapterReadinessRecords =
      await second.codexExecRealReadOnlyAdapterReadiness.listReadinessPackages({
        dryRunId: 'codex_dry_run_1',
        status: 'requires_review',
        limit: 10,
      });
    const realReadOnlyAdapterReadinessRecord =
      await second.codexExecRealReadOnlyAdapterReadiness.getReadinessPackage(
        'codex_real_read_only_adapter_readiness_package_1',
      );
    const latestRealReadOnlyAdapterReadinessRecord =
      await second.codexExecRealReadOnlyAdapterReadiness.latestReadinessPackage('codex_dry_run_1');
    const realReadOnlyAdapterReadinessReviewRecords =
      await second.codexExecRealReadOnlyAdapterReadinessReviews.listReadinessReviews({
        dryRunId: 'codex_dry_run_1',
        outcome: 'conditional_go_to_separate_adr_draft',
        limit: 10,
      });
    const realReadOnlyAdapterReadinessReviewRecord =
      await second.codexExecRealReadOnlyAdapterReadinessReviews.getReadinessReview(
        'codex_real_read_only_adapter_readiness_review_1',
      );
    const latestRealReadOnlyAdapterReadinessReviewRecord =
      await second.codexExecRealReadOnlyAdapterReadinessReviews.latestReadinessReview(
        'codex_dry_run_1',
      );
    const realReadOnlyAdapterAttempts =
      await second.codexExecRealReadOnlyAdapterAttempts.listAttempts({
        dryRunId: 'codex_dry_run_1',
        status: 'blocked',
        limit: 10,
      });
    const realReadOnlyAdapterAttemptRecord =
      await second.codexExecRealReadOnlyAdapterAttempts.getAttempt(
        'codex_real_read_only_adapter_attempt_1',
      );
    const realReadOnlyAdapterFailedAttempts =
      await second.codexExecRealReadOnlyAdapterAttempts.listAttempts({
        dryRunId: 'codex_dry_run_1',
        status: 'failed',
        limit: 10,
      });
    const realReadOnlyAdapterFailedAttemptRecord =
      await second.codexExecRealReadOnlyAdapterAttempts.getAttempt(
        'codex_real_read_only_adapter_attempt_failed_1',
      );
    const latestRealReadOnlyAdapterAttemptRecord =
      await second.codexExecRealReadOnlyAdapterAttempts.latestAttempt('codex_dry_run_1');
    const realReadOnlyAdapterApprovalAuthorityTraces =
      await second.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.listApprovalAuthorityTraces({
        dryRunId: 'codex_dry_run_1',
        status: 'aligned',
        limit: 10,
      });
    const realReadOnlyAdapterApprovalAuthorityTraceRecord =
      await second.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.getApprovalAuthorityTrace(
        'codex_real_read_only_adapter_approval_authority_trace_1',
      );
    const latestRealReadOnlyAdapterApprovalAuthorityTraceRecord =
      await second.codexExecRealReadOnlyAdapterApprovalAuthorityTraces.latestApprovalAuthorityTrace(
        'codex_dry_run_1',
      );
    const realReadOnlyAdapterPilotPrerequisites =
      await second.codexExecRealReadOnlyAdapterPilotPrerequisites.listPilotPrerequisites({
        dryRunId: 'codex_dry_run_1',
        status: 'blocked',
        limit: 10,
      });
    const realReadOnlyAdapterPilotPrerequisiteRecord =
      await second.codexExecRealReadOnlyAdapterPilotPrerequisites.getPilotPrerequisite(
        'codex_real_read_only_adapter_pilot_prerequisite_1',
      );
    const latestRealReadOnlyAdapterPilotPrerequisiteRecord =
      await second.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
        'codex_dry_run_1',
      );
    const realReadOnlyAdapterPilotSourcePreparations =
      await second.codexExecRealReadOnlyAdapterPilotSourcePreparations.listPilotSourcePreparations({
        dryRunId: 'codex_dry_run_1',
        status: 'blocked',
        limit: 10,
      });
    const realReadOnlyAdapterPilotSourcePreparationRecord =
      await second.codexExecRealReadOnlyAdapterPilotSourcePreparations.getPilotSourcePreparation(
        'codex_real_read_only_adapter_pilot_source_preparation_1',
      );
    const latestRealReadOnlyAdapterPilotSourcePreparationRecord =
      await second.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
        'codex_dry_run_1',
      );
    await second.close();

    expect(resolveCodexHubDbPath({ dbPath })).toBe(dbPath);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.workflowName).toBe('development.bootstrap');
    expect(developmentRuns).toHaveLength(1);
    expect(developmentRuns[0]?.summary.requestTitle).toBe(
      'Add Electron CDP read-only observation skeleton',
    );
    expect(developmentRun?.id).toBe('development_run_1');
    expect(codexReplays).toHaveLength(1);
    expect(codexReplays[0]?.fixturePath).toBe(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );
    expect(codexReplayRecord?.storageMetadata.bodyStored).toBe(false);
    expect(JSON.stringify(codexReplayRecord)).not.toContain('thread.started');
    expect(codexExecLiveRuns).toHaveLength(1);
    expect(codexExecLiveRuns[0]?.status).toBe('blocked');
    expect(codexExecLiveRunRecord?.promptBodyStored).toBe(false);
    expect(JSON.stringify(codexExecLiveRunRecord)).not.toContain('list risk areas');
    expect(evidenceRefs).toHaveLength(1);
    expect(evidenceRecord?.summary).toBe('Evidence summary only');
    expect(auditEvents).toHaveLength(1);
    expect(auditRecord?.policyDecisionId).toBe('policy_1');
    expect(codexExecApprovals).toHaveLength(1);
    expect(codexExecApprovals[0]?.status).toBe('approved');
    expect(codexExecApprovalRecord?.request.reason).toContain('hash sha256:');
    expect(codexExecApprovalByArtifact?.id).toBe('codex_approval_record_1');
    expect(codexExecApprovalsForDryRun).toHaveLength(1);
    expect(codexExecApprovalsForDryRun[0]?.approvalArtifact?.id).toBe(
      'codex_approval_artifact_1',
    );
    expect(JSON.stringify(codexExecApprovalRecord)).not.toContain('manual private reason');
    expect(browserDryRuns).toHaveLength(1);
    expect(browserDryRunRecord?.targetUrlHash).toBe('sha256:target');
    expect(browserApprovals).toHaveLength(1);
    expect(browserApprovalRecord?.approvalArtifactId).toBe('browser_approval_artifact_1');
    expect(browserApprovalByArtifact?.id).toBe('browser_approval_record_1');
    expect(browserRuns).toHaveLength(1);
    expect(browserRunRecord?.processBoundaryInvoked).toBe(true);
    expect(JSON.stringify({ browserDryRunRecord, browserApprovalRecord, browserRunRecord })).not.toContain(
      'http://localhost',
    );
    expect(JSON.stringify({ browserDryRunRecord, browserApprovalRecord, browserRunRecord })).not.toContain(
      'C:\\Users',
    );
    expect(electronDryRuns).toHaveLength(1);
    expect(electronDryRunRecord?.endpointIdHash).toBe('sha256:endpoint');
    expect(electronApprovals).toHaveLength(1);
    expect(electronApprovalRecord?.approvalArtifactId).toBe('electron_approval_artifact_1');
    expect(electronApprovalByArtifact?.id).toBe('electron_approval_record_1');
    expect(electronRuns).toHaveLength(1);
    expect(electronRunRecord?.cdpHttpBoundaryInvoked).toBe(true);
    expect(electronRunRecord?.processBoundaryInvoked).toBe(false);
    expect(JSON.stringify({ electronDryRunRecord, electronApprovalRecord, electronRunRecord })).not.toContain(
      '127.0.0.1',
    );
    expect(worktreeDryRuns).toHaveLength(1);
    expect(worktreeDryRunRecord?.worktreePathHash).toBe('sha256:path');
    expect(worktreeApprovals).toHaveLength(1);
    expect(worktreeApprovalRecord?.approvalArtifactId).toBe('worktree_approval_artifact_1');
    expect(worktreeApprovalByArtifact?.id).toBe('worktree_approval_record_1');
    expect(worktreeRuns).toHaveLength(1);
    expect(worktreeRunRecord?.gitProcessBoundaryInvoked).toBe(true);
    expect(worktreeRunRecord?.cleanupRequired).toBe(true);
    expect(JSON.stringify({ worktreeDryRunRecord, worktreeApprovalRecord, worktreeRunRecord })).not.toContain(
      'CodexHub-worktrees',
    );
    expect(JSON.stringify({ worktreeDryRunRecord, worktreeApprovalRecord, worktreeRunRecord })).not.toContain(
      'diff --git',
    );
    expect(worktreeCleanupDryRuns).toHaveLength(1);
    expect(worktreeCleanupDryRunRecord?.sourceRunId).toBe('worktree_control_run_1');
    expect(worktreeCleanupApprovals).toHaveLength(1);
    expect(worktreeCleanupApprovalRecord?.approvalArtifactId).toBe(
      'worktree_cleanup_approval_artifact_1',
    );
    expect(worktreeCleanupApprovalByArtifact?.id).toBe('worktree_cleanup_approval_record_1');
    expect(worktreeCleanupRuns).toHaveLength(1);
    expect(worktreeCleanupRunRecord?.cleanupCompleted).toBe(true);
    expect(worktreeCleanupRunRecord?.cleanupRequired).toBe(false);
    expect(
      JSON.stringify({
        worktreeCleanupDryRunRecord,
        worktreeCleanupApprovalRecord,
        worktreeCleanupRunRecord,
      }),
    ).not.toContain('CodexHub-worktrees');
    expect(
      JSON.stringify({
        worktreeCleanupDryRunRecord,
        worktreeCleanupApprovalRecord,
        worktreeCleanupRunRecord,
      }),
    ).not.toContain('git worktree remove');
    expect(customWorkflowDryRuns).toHaveLength(1);
    expect(customWorkflowDryRunRecord?.templateHash).toBe('sha256:custom-template');
    expect(customWorkflowApprovals).toHaveLength(1);
    expect(customWorkflowApprovalRecord?.approvalArtifactId).toBe(
      'custom_workflow_approval_artifact_1',
    );
    expect(customWorkflowApprovalByArtifact?.id).toBe('custom_workflow_approval_record_1');
    expect(customWorkflowRuns).toHaveLength(1);
    expect(customWorkflowRunRecord?.directAdapterExecutionAllowed).toBe(false);
    expect(customWorkflowRunRecord?.completedStepCount).toBe(1);
    expect(
      JSON.stringify({
        customWorkflowDryRunRecord,
        customWorkflowApprovalRecord,
        customWorkflowRunRecord,
      }),
    ).not.toContain('raw prompt');
    expect(
      JSON.stringify({
        customWorkflowDryRunRecord,
        customWorkflowApprovalRecord,
        customWorkflowRunRecord,
      }),
    ).not.toContain('adapter.execute');
    expect(
      findAdversarialPublicOutputRoundTripLeaks({
        customWorkflowDryRuns,
        customWorkflowDryRunRecord,
        customWorkflowApprovals,
        customWorkflowApprovalRecord,
        customWorkflowRuns,
        customWorkflowRunRecord,
      }),
    ).toEqual([]);
    expect(recoveryDryRuns).toHaveLength(1);
    expect(recoveryDryRunRecord?.childAdapterExecuteAllowed).toBe(false);
    expect(recoveryApprovals).toHaveLength(1);
    expect(recoveryApprovalRecord?.childApprovalsIncluded).toBe(false);
    expect(recoveryApprovalByArtifact?.id).toBe(
      'production_workflow_recovery_approval_record_1',
    );
    expect(recoveryRuns).toHaveLength(1);
    expect(recoveryRunRecord?.waitingChildApprovalCount).toBe(1);
    expect(recoveryRunRecord?.childAdapterExecuteAllowed).toBe(false);
    expect(recoveryChildStates).toHaveLength(1);
    expect(recoveryChildStateRecord?.state.childAutoApprovalAllowed).toBe(false);
    expect(
      findAdversarialPublicOutputRoundTripLeaks({
        recoveryDryRuns,
        recoveryDryRunRecord,
        recoveryApprovals,
        recoveryApprovalRecord,
        recoveryRuns,
        recoveryRunRecord,
        recoveryChildStates,
        recoveryChildStateRecord,
      }),
    ).toEqual([]);
    expect(reportReviews).toHaveLength(1);
    expect(reportReviewRecord?.recommendationGrantsExecution).toBe(false);
    expect(JSON.stringify(reportReviewRecord)).not.toContain('full report markdown');
    expect(adrDecisions).toHaveLength(1);
    expect(adrDecisionRecord?.implementationApproved).toBe(false);
    expect(adrDecisionRecord?.processAdapterApproved).toBe(false);
    expect(adrDecisionRecord?.dashboardTriggerAllowed).toBe(false);
    expect(adrDecisionRecord?.allowedSandboxModes).toEqual(['read_only']);
    expect(adrDecisionRecord?.forbiddenSandboxModes).toEqual([
      'workspace_write',
      'danger_full_access',
    ]);
    expect(JSON.stringify(adrDecisionRecord)).not.toContain('full command body');
    expect(simulatorReviews).toHaveLength(1);
    expect(simulatorReviewRecord?.implementationApproved).toBe(false);
    expect(simulatorReviewRecord?.processAdapterApproved).toBe(false);
    expect(simulatorReviewRecord?.recommendationGrantsExecution).toBe(false);
    expect(simulatorReviewRecord?.hardGateCount).toBe(2);
    expect(JSON.stringify(simulatorReviewRecord)).not.toContain('full command body');
    expect(implementationPlanReviews).toHaveLength(1);
    expect(implementationPlanReviewRecord?.disabledSkeletonApproved).toBe(true);
    expect(implementationPlanReviewRecord?.implementationApproved).toBe(false);
    expect(implementationPlanReviewRecord?.processAdapterApproved).toBe(false);
    expect(implementationPlanReviewRecord?.workspaceWriteAllowed).toBe(false);
    expect(implementationPlanReviewRecord?.dangerFullAccessAllowed).toBe(false);
    expect(JSON.stringify(implementationPlanReviewRecord)).not.toContain('full command body');
    expect(skeletonReviews).toHaveLength(1);
    expect(skeletonReviewRecord?.fixtureBoundaryAllowed).toBe(true);
    expect(skeletonReviewRecord?.processAdapterApproved).toBe(false);
    expect(skeletonReviewRecord?.recommendationGrantsExecution).toBe(false);
    expect(JSON.stringify(skeletonReviewRecord)).not.toContain('full command body');
    expect(finalReadinessRecords).toHaveLength(1);
    expect(finalReadinessRecord?.realAdapterRequiresSeparateAdr).toBe(true);
    expect(finalReadinessRecord?.currentRoundApprovesProcessStart).toBe(false);
    expect(finalReadinessRecord?.currentRoundApprovesCodexExecution).toBe(false);
    expect(finalReadinessRecord?.currentRoundApprovesWorkspaceWrites).toBe(false);
    expect(JSON.stringify(finalReadinessRecord)).not.toContain('full command body');
    expect(realReadOnlyAdapterReadinessRecords).toHaveLength(1);
    expect(realReadOnlyAdapterReadinessRecord?.status).toBe('requires_review');
    expect(realReadOnlyAdapterReadinessRecord?.documentedOnly3twEvidence).toBe(true);
    expect(realReadOnlyAdapterReadinessRecord?.implementationApproved).toBe(false);
    expect(realReadOnlyAdapterReadinessRecord?.processAdapterApproved).toBe(false);
    expect(realReadOnlyAdapterReadinessRecord?.recommendationGrantsExecution).toBe(false);
    expect(latestRealReadOnlyAdapterReadinessRecord?.id).toBe(
      'codex_real_read_only_adapter_readiness_package_1',
    );
    expect(JSON.stringify(realReadOnlyAdapterReadinessRecord)).not.toContain(
      'full report markdown',
    );
    expect(JSON.stringify(realReadOnlyAdapterReadinessRecord)).not.toContain('full command body');
    expect(realReadOnlyAdapterReadinessReviewRecords).toHaveLength(1);
    expect(realReadOnlyAdapterReadinessReviewRecord?.separateAdrDraftAllowed).toBe(true);
    expect(realReadOnlyAdapterReadinessReviewRecord?.implementationApproved).toBe(false);
    expect(realReadOnlyAdapterReadinessReviewRecord?.processAdapterApproved).toBe(false);
    expect(realReadOnlyAdapterReadinessReviewRecord?.recommendationGrantsExecution).toBe(false);
    expect(latestRealReadOnlyAdapterReadinessReviewRecord?.id).toBe(
      'codex_real_read_only_adapter_readiness_review_1',
    );
    expect(JSON.stringify(realReadOnlyAdapterReadinessReviewRecord)).not.toContain(
      'full report markdown',
    );
    expect(JSON.stringify(realReadOnlyAdapterReadinessReviewRecord)).not.toContain(
      'full command body',
    );
    expect(realReadOnlyAdapterAttempts).toHaveLength(1);
    expect(realReadOnlyAdapterAttempts[0]?.boundaryDeferredReasonCode).toBe(
      'executable_resolution_blocked',
    );
    expect(
      realReadOnlyAdapterAttempts[0]?.boundaryDeferredDiagnostics?.executableResolutionStatus,
    ).toBe('blocked');
    expect(realReadOnlyAdapterAttemptRecord?.status).toBe('blocked');
    expect(realReadOnlyAdapterAttemptRecord?.authoritative).toBe(true);
    expect(realReadOnlyAdapterAttemptRecord?.supervisorBacked).toBe(true);
    expect(realReadOnlyAdapterAttemptRecord?.persisted).toBe(true);
    expect(realReadOnlyAdapterAttemptRecord?.processBoundaryInvoked).toBe(false);
    expect(realReadOnlyAdapterAttemptRecord?.preflightStatus).toBe('passed');
    expect(realReadOnlyAdapterAttemptRecord?.resultErrorCode).toBe('boundary_deferred');
    expect(realReadOnlyAdapterAttemptRecord?.boundaryDeferredReasonCode).toBe(
      'executable_resolution_blocked',
    );
    expect(realReadOnlyAdapterAttemptRecord?.boundaryDeferredReasonCodes).toEqual([
      'executable_resolution_blocked',
    ]);
    expect(
      realReadOnlyAdapterAttemptRecord?.boundaryDeferredDiagnostics
        ?.executableResolutionStatus,
    ).toBe('blocked');
    expect(
      realReadOnlyAdapterAttemptRecord?.boundaryDeferredDiagnostics
        ?.executableResolutionReasonCode,
    ).toBe('executable_inaccessible');
    expect(realReadOnlyAdapterAttemptRecord?.boundaryDeferredDiagnostics?.cwdSelfCheckStatus).toBe(
      'passed',
    );
    expect(
      realReadOnlyAdapterAttemptRecord?.boundaryDeferredDiagnostics?.processBoundaryReady,
    ).toBe(false);
    expect(realReadOnlyAdapterAttemptRecord?.implementationApproved).toBe(false);
    expect(realReadOnlyAdapterAttemptRecord?.processAdapterApproved).toBe(false);
    expect(realReadOnlyAdapterAttemptRecord?.recommendationGrantsExecution).toBe(false);
    expect(latestRealReadOnlyAdapterAttemptRecord?.id).toBe(
      'codex_real_read_only_adapter_attempt_1',
    );
    expect(latestRealReadOnlyAdapterAttemptRecord?.boundaryDeferredReasonCode).toBe(
      'executable_resolution_blocked',
    );
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('raw prompt body');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('raw command body');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('raw stdout body');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('raw stderr body');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('"argv"');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('"executablePath":');
    expect(JSON.stringify(realReadOnlyAdapterAttemptRecord)).not.toContain('C:/');
    expect(realReadOnlyAdapterFailedAttempts).toHaveLength(1);
    expect(realReadOnlyAdapterFailedAttemptRecord?.processBoundaryInvoked).toBe(true);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnosticsComplete).toBe(true);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnosticsMissingFields).toEqual([]);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.failureCode).toBe(
      'process_exit_nonzero',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.exitCode).toBe(2);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.startFailureKind).toBe(
      'none',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.platform).toBe(
      'win32',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.resolvedExecutableKind).toBe(
      'native_exe',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.stdoutHash).toBe(
      'sha256:stdout',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.stderrHash).toBe(
      'sha256:stderr',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.stdoutByteLength).toBe(12);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.stderrByteLength).toBe(14);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.cwdHash).toBe(
      'sha256:cwd',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.cwdExists).toBe(true);
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.cwdIsDirectory).toBe(
      true,
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.executableExists).toBe(
      true,
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.executableAccessible).toBe(
      true,
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.envAllowlistKeyCount).toBe(
      6,
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.boundaryDiagnostics?.envAllowlistKeyHash).toBe(
      'sha256:env_keys',
    );
    expect(realReadOnlyAdapterFailedAttemptRecord?.postRunVerificationStatus).toBe('skipped');
    expect(realReadOnlyAdapterFailedAttemptRecord?.postRunVerificationSkipReason).toBe(
      'attempt_not_completed',
    );
    expect(JSON.stringify(realReadOnlyAdapterFailedAttemptRecord)).not.toContain('raw stdout body');
    expect(JSON.stringify(realReadOnlyAdapterFailedAttemptRecord)).not.toContain('raw stderr body');
    expect(JSON.stringify(realReadOnlyAdapterFailedAttemptRecord)).not.toContain('"argv"');
    expect(JSON.stringify(realReadOnlyAdapterFailedAttemptRecord)).not.toContain('"executablePath":');
    expect(realReadOnlyAdapterApprovalAuthorityTraces).toHaveLength(1);
    expect(realReadOnlyAdapterApprovalAuthorityTraceRecord?.status).toBe('aligned');
    expect(realReadOnlyAdapterApprovalAuthorityTraceRecord?.attemptPreflightWouldAccept).toBe(true);
    expect(realReadOnlyAdapterApprovalAuthorityTraceRecord?.fallbackUsedAsAuthority).toBe(false);
    expect(latestRealReadOnlyAdapterApprovalAuthorityTraceRecord?.id).toBe(
      'codex_real_read_only_adapter_approval_authority_trace_1',
    );
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain(
      'raw prompt body',
    );
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain(
      'raw command body',
    );
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain(
      'raw stdout body',
    );
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain(
      'raw stderr body',
    );
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain('"argv"');
    expect(JSON.stringify(realReadOnlyAdapterApprovalAuthorityTraceRecord)).not.toContain(
      '"executablePath":',
    );
    expect(realReadOnlyAdapterPilotPrerequisites).toHaveLength(1);
    expect(realReadOnlyAdapterPilotPrerequisiteRecord?.status).toBe('blocked');
    expect(realReadOnlyAdapterPilotPrerequisiteRecord?.pilotExecuted).toBe(false);
    expect(realReadOnlyAdapterPilotPrerequisiteRecord?.adapterAttemptInvoked).toBe(false);
    expect(realReadOnlyAdapterPilotPrerequisiteRecord?.fallbackUsedAsAuthority).toBe(false);
    expect(latestRealReadOnlyAdapterPilotPrerequisiteRecord?.id).toBe(
      'codex_real_read_only_adapter_pilot_prerequisite_1',
    );
    expect(JSON.stringify(realReadOnlyAdapterPilotPrerequisiteRecord)).not.toContain(
      'C:/safe/worktree',
    );
    expect(JSON.stringify(realReadOnlyAdapterPilotPrerequisiteRecord)).not.toContain(
      'raw prompt body',
    );
    expect(realReadOnlyAdapterPilotSourcePreparations).toHaveLength(1);
    expect(realReadOnlyAdapterPilotSourcePreparationRecord?.status).toBe('blocked');
    expect(realReadOnlyAdapterPilotSourcePreparationRecord?.pilotExecuted).toBe(false);
    expect(realReadOnlyAdapterPilotSourcePreparationRecord?.adapterAttemptInvoked).toBe(false);
    expect(realReadOnlyAdapterPilotSourcePreparationRecord?.fallbackUsedAsAuthority).toBe(false);
    expect(latestRealReadOnlyAdapterPilotSourcePreparationRecord?.id).toBe(
      'codex_real_read_only_adapter_pilot_source_preparation_1',
    );
    expect(JSON.stringify(realReadOnlyAdapterPilotSourcePreparationRecord)).not.toContain(
      'C:/safe/worktree',
    );
    expect(JSON.stringify(realReadOnlyAdapterPilotSourcePreparationRecord)).not.toContain(
      'raw prompt body',
    );
  });

  it('persists GitHub draft PR dry-runs, approvals, and runs', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-store-github-draft-pr-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const dryRun = createGithubDraftPrDryRunFixture();
    const approval = createGithubDraftPrApprovalFixture();
    const run = createGithubDraftPrRunFixture(dryRun);

    await first.githubDraftPrDryRuns.saveDryRun(dryRun);
    await first.githubDraftPrApprovals.saveApproval(approval);
    await first.githubDraftPrRuns.saveRun(run);
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const dryRuns = await second.githubDraftPrDryRuns.listDryRuns({
      dryRunId: 'github_draft_pr_dry_run_1',
      status: 'planned',
      limit: 10,
    });
    const dryRunRecord = await second.githubDraftPrDryRuns.getDryRun('github_draft_pr_plan_1');
    const approvals = await second.githubDraftPrApprovals.listApprovals({
      dryRunId: 'github_draft_pr_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const approvalRecord =
      await second.githubDraftPrApprovals.getApproval('github_draft_pr_approval_record_1');
    const approvalByArtifact = await second.githubDraftPrApprovals.getApprovalByArtifactId(
      'github_draft_pr_approval_artifact_1',
    );
    const runs = await second.githubDraftPrRuns.listRuns({
      dryRunId: 'github_draft_pr_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const runRecord = await second.githubDraftPrRuns.getRun('github_draft_pr_run_1');
    const serialized = JSON.stringify({ dryRunRecord, approvalRecord, runRecord });
    await second.close();

    expect(dryRuns).toHaveLength(1);
    expect(dryRunRecord?.networkBoundaryPlanned).toBe(true);
    expect(approvals).toHaveLength(1);
    expect(approvalRecord?.approvalArtifactId).toBe('github_draft_pr_approval_artifact_1');
    expect(approvalByArtifact?.id).toBe('github_draft_pr_approval_record_1');
    expect(runs).toHaveLength(1);
    expect(runRecord?.networkBoundaryInvoked).toBe(true);
    expect(runRecord?.noRealWrite).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m16');
    expect(serialized).not.toContain('https://github.com');
    expect(
      findAdversarialPublicOutputRoundTripLeaks({
        dryRuns,
        dryRunRecord,
        approvals,
        approvalRecord,
        runs,
        runRecord,
      }),
    ).toEqual([]);
  });

  it('persists GitHub branch publish dry-runs, approvals, and runs', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-store-github-branch-publish-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const dryRun = createGithubBranchPublishDryRunFixture();
    const approval = createGithubBranchPublishApprovalFixture();
    const run = createGithubBranchPublishRunFixture(dryRun);

    await first.githubBranchPublishDryRuns.saveDryRun(dryRun);
    await first.githubBranchPublishApprovals.saveApproval(approval);
    await first.githubBranchPublishRuns.saveRun(run);
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const dryRuns = await second.githubBranchPublishDryRuns.listDryRuns({
      dryRunId: 'github_branch_publish_dry_run_1',
      status: 'planned',
      limit: 10,
    });
    const dryRunRecord =
      await second.githubBranchPublishDryRuns.getDryRun('github_branch_publish_plan_1');
    const approvals = await second.githubBranchPublishApprovals.listApprovals({
      dryRunId: 'github_branch_publish_dry_run_1',
      status: 'approved',
      limit: 10,
    });
    const approvalRecord = await second.githubBranchPublishApprovals.getApproval(
      'github_branch_publish_approval_record_1',
    );
    const approvalByArtifact =
      await second.githubBranchPublishApprovals.getApprovalByArtifactId(
        'github_branch_publish_approval_artifact_1',
      );
    const runs = await second.githubBranchPublishRuns.listRuns({
      dryRunId: 'github_branch_publish_dry_run_1',
      status: 'completed',
      limit: 10,
    });
    const runRecord = await second.githubBranchPublishRuns.getRun('github_branch_publish_run_1');
    const serialized = JSON.stringify({ dryRunRecord, approvalRecord, runRecord });
    await second.close();

    expect(dryRuns).toHaveLength(1);
    expect(dryRunRecord?.networkBoundaryPlanned).toBe(true);
    expect(dryRunRecord?.updateRefAllowed).toBe(false);
    expect(approvals).toHaveLength(1);
    expect(approvalRecord?.approvalArtifactId).toBe(
      'github_branch_publish_approval_artifact_1',
    );
    expect(approvalByArtifact?.id).toBe('github_branch_publish_approval_record_1');
    expect(runs).toHaveLength(1);
    expect(runRecord?.networkBoundaryInvoked).toBe(true);
    expect(runRecord?.noRealWrite).toBe(false);
    expect(runRecord?.updateRefAllowed).toBe(false);
    expect(runRecord?.pushAllowed).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m17');
    expect(serialized).not.toContain('packages/example/src/index.ts');
    expect(serialized).not.toContain('export const answer');
    expect(serialized).not.toContain('new-commit-sha');
    expect(
      findAdversarialPublicOutputRoundTripLeaks({
        dryRuns,
        dryRunRecord,
        approvals,
        approvalRecord,
        runs,
        runRecord,
      }),
    ).toEqual([]);
  });

  it('persists GitHub publish to draft PR chain dry-runs and runs', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-store-github-chain-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const dryRun = createGithubPublishDraftPrChainDryRunFixture();
    const run = createGithubPublishDraftPrChainRunFixture(dryRun);

    await first.githubPublishDraftPrChainDryRuns.saveDryRun(dryRun);
    await first.githubPublishDraftPrChainRuns.saveRun(run);
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const dryRuns = await second.githubPublishDraftPrChainDryRuns.listDryRuns({ limit: 10 });
    const dryRunRecord = await second.githubPublishDraftPrChainDryRuns.getDryRun(
      'github_publish_draft_pr_chain_plan_1',
    );
    const runs = await second.githubPublishDraftPrChainRuns.listRuns({
      status: 'completed',
      limit: 10,
    });
    const runRecord = await second.githubPublishDraftPrChainRuns.getRun(
      'github_publish_draft_pr_chain_run_1',
    );
    const serialized = JSON.stringify({ dryRunRecord, runRecord });
    await second.close();

    expect(dryRuns).toHaveLength(1);
    expect(dryRunRecord?.separateApprovalsRequired).toBe(true);
    expect(runs).toHaveLength(1);
    expect(runRecord?.networkBoundaryInvoked).toBe(true);
    expect(runRecord?.stepCount).toBe(3);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m18');
    expect(serialized).not.toContain('https://github.com');
    expect(serialized).not.toContain('ghp_');
  });
});

function createCustomWorkflowPlanFixture(): CustomWorkflowPlan {
  const createdAt = '2026-04-28T00:00:20.000Z';
  const validationReport = {
    id: 'custom_workflow_validation_report_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    templateId: 'fixture.custom-workflow.local-pilot',
    templateHash: 'sha256:custom-template',
    status: 'valid' as const,
    issueCount: 0,
    issues: [],
    stepCount: 1,
    unknownStepKindCount: 0,
    policyWeakeningDetected: false as const,
    loopOrBranchingDetected: false as const,
    arbitraryConfigPathAllowed: false as const,
    bodyStored: false as const,
    rawPathStored: false as const,
    summary: 'Custom workflow template validation passed.',
  };
  const stepPlan = {
    stepId: 'readiness',
    kind: 'readiness' as const,
    actionMode: 'read' as const,
    riskLevel: 'low' as const,
    requiresApproval: false,
    childApprovalRequired: false,
    policyRequired: true as const,
    evidenceRequired: true as const,
    auditRequired: true as const,
    directAdapterExecutionAllowed: false as const,
    summary: 'Readiness step is metadata-only.',
  };

  return {
    id: 'custom_workflow_plan_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'custom_workflow_dry_run_1',
    templateId: 'fixture.custom-workflow.local-pilot',
    templateHash: 'sha256:custom-template',
    status: 'planned',
    validationReport,
    stepPlans: [stepPlan],
    stepCount: 1,
    approvalRequired: true,
    childApprovalsRequired: 0,
    blockReasons: [],
    evidenceRefIds: ['evidence_custom_workflow_plan_1'],
    auditEventIds: ['audit_custom_workflow_plan_1'],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Custom workflow dry-run plan stores metadata only.',
  };
}

function createCustomWorkflowApprovalFixture(): CustomWorkflowApprovalArtifactRecord {
  return {
    id: 'custom_workflow_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:21.000Z',
    dryRunId: 'custom_workflow_dry_run_1',
    templateId: 'fixture.custom-workflow.local-pilot',
    templateHash: 'sha256:custom-template',
    approvalArtifactId: 'custom_workflow_approval_artifact_1',
    status: 'approved',
    approvedBy: 'local-operator',
    reasonHash: 'sha256:reason',
    reasonSummary: 'Reason stored as hash only.',
    bodyStored: false,
    rawPathStored: false,
    summary: 'Custom workflow approval stores reason hash only.',
  };
}

function createCustomWorkflowRunFixture(): CustomWorkflowRun {
  return {
    id: 'custom_workflow_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:22.000Z',
    dryRunId: 'custom_workflow_dry_run_1',
    approvalArtifactId: 'custom_workflow_approval_artifact_1',
    templateId: 'fixture.custom-workflow.local-pilot',
    templateHash: 'sha256:custom-template',
    status: 'completed',
    steps: [
      {
        stepId: 'readiness',
        kind: 'readiness',
        status: 'completed',
        childHashBindingMatched: false,
        childApprovalRequired: false,
        childExecutionInvoked: false,
        directAdapterExecutionAllowed: false,
        blockReasons: [],
        evidenceRefIds: ['evidence_custom_workflow_run_1'],
        auditEventIds: ['audit_custom_workflow_run_1'],
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        networkBoundaryInvoked: false,
        bodyStored: false,
        rawPathStored: false,
        summary: 'Readiness step completed from metadata.',
      },
    ],
    stepCount: 1,
    completedStepCount: 1,
    blockedStepCount: 0,
    childApprovalsRequired: 0,
    blockReasons: [],
    evidenceRefIds: ['evidence_custom_workflow_run_1'],
    auditEventIds: ['audit_custom_workflow_run_1'],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Custom workflow coordinator completed metadata-only run.',
  };
}

function createGithubPublishDraftPrChainDryRunFixture(): GithubPublishDraftPrChainPlan {
  return {
    id: 'github_publish_draft_pr_chain_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:03.000Z',
    chainId: 'github_publish_draft_pr_chain_1',
    sourceKind: 'local_rc_readiness',
    sourceIdHash: 'sha256:source',
    branchPublishDryRunId: 'github_branch_publish_dry_run_1',
    draftPrDryRunId: 'github_draft_pr_dry_run_1',
    separateApprovalsRequired: true,
    branchPublishApprovalRequired: true,
    draftPrApprovalRequired: true,
    networkBoundaryPlanned: true,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      integration: 'github-provider',
      chainIdHash: 'sha256:chain',
    },
    summary: 'GitHub publish to draft PR chain dry-run stores metadata only.',
  };
}

function createGithubPublishDraftPrChainRunFixture(
  plan: GithubPublishDraftPrChainPlan,
): GithubPublishDraftPrChainRun {
  const targetRef = createGithubRemoteRefFixture();
  const lifecycleSummary: GithubRemotePrLifecycleSummary = {
    id: 'github_pr_lifecycle_summary_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:04.000Z',
    targetRef,
    prNumberHash: 'sha256:pr-number',
    prUrlHash: 'sha256:pr-url',
    stateHash: 'sha256:state',
    checkRunCount: 1,
    statusContextCount: 1,
    failedCheckCount: 0,
    pendingCheckCount: 0,
    passedCheckCount: 1,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      targetRefIdHash: 'sha256:target-ref',
    },
    summary: 'GitHub PR lifecycle summary stores hashes and counts only.',
  };

  return {
    id: 'github_publish_draft_pr_chain_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:04.000Z',
    chainId: plan.chainId,
    status: 'completed',
    plan,
    steps: [
      createGithubPublishDraftPrChainStepFixture('branch-publish', 0),
      createGithubPublishDraftPrChainStepFixture('draft-pr-create', 1),
      createGithubPublishDraftPrChainStepFixture('pr-lifecycle-observe', 2),
    ],
    stepCount: 3,
    branchPublishRunId: 'github_branch_publish_run_1',
    draftPrRunId: 'github_draft_pr_run_1',
    lifecycleSummary,
    blockReasons: [],
    evidenceRefs: [],
    auditEventIds: ['audit_github_publish_draft_pr_chain_1'],
    networkBoundaryInvoked: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      chainIdHash: 'sha256:chain',
    },
    summary: 'GitHub publish to draft PR chain run stores metadata only.',
  };
}

function createGithubPublishDraftPrChainStepFixture(
  phase: 'branch-publish' | 'draft-pr-create' | 'pr-lifecycle-observe',
  order: number,
): GithubPublishDraftPrChainStep {
  return {
    id: `github_publish_draft_pr_chain_step_${order}`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:04.000Z',
    phase,
    status: 'completed' as const,
    order,
    evidenceRefIds: [],
    auditEventIds: [`audit_github_publish_draft_pr_chain_step_${order}`],
    networkBoundaryInvoked: order < 2,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      phase,
    },
    summary: `${phase} fixture step stores metadata only.`,
  };
}

function createGithubRemoteRefFixture(): GithubRemoteRefSummary {
  return {
    id: 'github_remote_ref_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:00.000Z',
    hostHash: 'sha256:host',
    ownerHash: 'sha256:owner',
    repoHash: 'sha256:repo',
    baseBranchHash: 'sha256:base',
    headBranchHash: 'sha256:head',
    allowedHost: 'api.github.com',
    rawOwnerStored: false,
    rawRepoStored: false,
    rawRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      hostHash: 'sha256:host',
      ownerHash: 'sha256:owner',
      repoHash: 'sha256:repo',
    },
    summary: 'GitHub remote ref fixture stores hashes only.',
  };
}

function createGithubDraftPrDryRunFixture(): GithubDraftPrPlan {
  const createdAt = '2026-05-05T00:00:00.000Z';
  const targetRef = createGithubRemoteRefFixture();

  return {
    id: 'github_draft_pr_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'github_draft_pr_dry_run_1',
    status: 'planned',
    runnerMode: 'controlled-github-draft-pr',
    readiness: {
      id: 'github_draft_pr_readiness_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      sourceKind: 'local_rc_readiness',
      sourceIdHash: 'sha256:source',
      sourceSummaryHash: 'sha256:source-summary',
      targetRef,
      status: 'ready_for_draft_pr',
      blockerCount: 0,
      draftOnly: true,
      remoteHeadBranchExistsRequired: true,
      pushAllowed: false,
      createRefAllowed: false,
      mergeAllowed: false,
      labelsAllowed: false,
      reviewersAllowed: false,
      commentsAllowed: false,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      metadata: {
        integration: 'github-provider',
        sourceIdHash: 'sha256:source',
        targetRefIdHash: 'sha256:target-ref',
      },
      summary: 'Draft PR readiness fixture is ready with hashes only.',
    },
    titleHash: 'sha256:title',
    bodyHash: 'sha256:body',
    bodySectionCount: 2,
    bodyCharacterCount: 42,
    blockReasons: [],
    policyDecision: {
      id: 'github_draft_pr_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'github_draft_pr_dry_run_1',
      actionType: 'github.draft_pr.create',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['approval required'],
      requiresDryRun: true,
      requiresApproval: true,
    },
    requiresApproval: true,
    networkBoundaryPlanned: true,
    networkBoundaryInvoked: false,
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceRefs: [],
    auditEventIds: ['audit_github_draft_pr_plan_1'],
    metadata: {
      integration: 'github-provider',
      targetRefIdHash: 'sha256:target-ref',
      titleHash: 'sha256:title',
      bodyHash: 'sha256:body',
    },
    summary: 'GitHub draft PR dry-run fixture stores metadata only.',
  };
}

function createGithubDraftPrApprovalFixture(): GithubDraftPrApprovalArtifactRecord {
  return {
    id: 'github_draft_pr_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:01.000Z',
    dryRunId: 'github_draft_pr_dry_run_1',
    dryRunRecordId: 'github_draft_pr_plan_1',
    approvalRequestId: 'github_draft_pr_approval_request_1',
    approvalArtifactId: 'github_draft_pr_approval_artifact_1',
    status: 'approved',
    approved: true,
    policyDecisionId: 'github_draft_pr_policy_1',
    requestedByHash: 'sha256:operator',
    decidedByHash: 'sha256:approver',
    reasonHash: 'sha256:reason',
    evidenceRefs: [],
    auditEventIds: ['audit_github_draft_pr_approval_1'],
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      dryRunIdHash: 'sha256:dry-run',
      approvalArtifactIdHash: 'sha256:artifact',
      status: 'approved',
    },
    summary: 'GitHub draft PR approval fixture stores hashes only.',
  };
}

function createGithubDraftPrRunFixture(plan: GithubDraftPrPlan): GithubDraftPrRun {
  return {
    id: 'github_draft_pr_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:02.000Z',
    dryRunId: 'github_draft_pr_dry_run_1',
    dryRunRecordId: 'github_draft_pr_plan_1',
    approvalArtifactId: 'github_draft_pr_approval_artifact_1',
    status: 'completed',
    plan,
    creationSummary: {
      id: 'github_draft_pr_creation_summary_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-05-05T00:00:02.000Z',
      targetRef: plan.readiness.targetRef,
      prNumberHash: 'sha256:pr-number',
      prUrlHash: 'sha256:pr-url',
      titleHash: 'sha256:title',
      bodyHash: 'sha256:body',
      draft: true,
      created: true,
      rawUrlStored: false,
      rawPrBodyStored: false,
      rawPathStored: false,
      bodyStored: false,
      metadata: {
        integration: 'github-provider',
        prNumberHash: 'sha256:pr-number',
        prUrlHash: 'sha256:pr-url',
      },
      summary: 'GitHub draft PR creation fixture stores remote identifiers as hashes only.',
    },
    auditChain: {
      id: 'github_draft_pr_audit_chain_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-05-05T00:00:02.000Z',
      draftPrRunIdHash: 'sha256:run',
      auditEventIds: ['audit_github_draft_pr_run_1'],
      auditEventCount: 1,
      policyDecisionIds: ['github_draft_pr_policy_1'],
      evidenceRefIds: ['evidence_github_draft_pr_run_1'],
      evidenceRefCount: 1,
      networkBoundaryCount: 1,
      chainHash: 'sha256:chain',
      rawPathStored: false,
      bodyStored: false,
      metadata: {
        integration: 'github-provider',
        networkBoundaryCount: 1,
      },
      summary: 'GitHub draft PR audit chain fixture stores ids and counts only.',
    },
    responseBodyHashes: ['sha256:repo', 'sha256:base', 'sha256:head', 'sha256:pulls', 'sha256:post'],
    blockReasons: [],
    evidenceRefs: [],
    auditEventIds: ['audit_github_draft_pr_run_1'],
    networkBoundaryInvoked: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: false,
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPrBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      dryRunIdHash: 'sha256:dry-run',
      status: 'completed',
      networkBoundaryInvoked: true,
    },
    summary: 'GitHub draft PR run fixture completed with hash-only output.',
  };
}

function createGithubBranchPublishDryRunFixture(): GithubBranchPublishPlan {
  const createdAt = '2026-05-05T00:00:00.000Z';
  const targetRef = createGithubRemoteRefFixture();
  const contentManifest: GithubCommitContentManifest = {
    id: 'github_branch_publish_content_manifest_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    sourceKind: 'local_rc_readiness' as const,
    sourceIdHash: 'sha256:source',
    worktreePathHash: 'sha256:worktree',
    fileCount: 1,
    totalByteCount: 26,
    filePathHashes: ['sha256:file-path'],
    fileContentHashes: ['sha256:file-content'],
    maxFileByteCount: 26,
    textOnly: true,
    deletionsAllowed: false,
    renamesAllowed: false,
    binaryAllowed: false,
    symlinkAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      fileCount: 1,
    },
    summary: 'GitHub branch publish content manifest fixture stores hashes only.',
  };

  return {
    id: 'github_branch_publish_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'github_branch_publish_dry_run_1',
    status: 'planned',
    runnerMode: 'controlled-github-branch-publish',
    readiness: {
      id: 'github_branch_publish_readiness_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      sourceKind: 'local_rc_readiness',
      sourceIdHash: 'sha256:source',
      sourceSummaryHash: 'sha256:source-summary',
      targetRef,
      contentManifest,
      status: 'ready_for_branch_publish',
      blockerCount: 0,
      newBranchRequired: true,
      branchPrefix: 'codexhub/',
      existingBranchUpdateAllowed: false,
      forceAllowed: false,
      pushAllowed: false,
      mergeAllowed: false,
      labelsAllowed: false,
      reviewersAllowed: false,
      commentsAllowed: false,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      metadata: {
        integration: 'github-provider',
        sourceIdHash: 'sha256:source',
        targetRefIdHash: 'sha256:target-ref',
        contentManifestIdHash: 'sha256:manifest',
      },
      summary: 'Branch publish readiness fixture is ready with hashes only.',
    },
    commitMessageHash: 'sha256:commit-message',
    blockReasons: [],
    policyDecision: {
      id: 'github_branch_publish_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'github_branch_publish_dry_run_1',
      actionType: 'github.branch_publish.create',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['approval required'],
      requiresDryRun: true,
      requiresApproval: true,
    },
    requiresApproval: true,
    networkBoundaryPlanned: true,
    networkBoundaryInvoked: false,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceRefs: [],
    auditEventIds: ['audit_github_branch_publish_plan_1'],
    metadata: {
      integration: 'github-provider',
      targetRefIdHash: 'sha256:target-ref',
      contentManifestIdHash: 'sha256:manifest',
      branchNameHash: 'sha256:branch',
    },
    summary: 'GitHub branch publish dry-run fixture stores metadata only.',
  };
}

function createGithubBranchPublishApprovalFixture(): GithubBranchPublishApprovalArtifactRecord {
  return {
    id: 'github_branch_publish_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:01.000Z',
    dryRunId: 'github_branch_publish_dry_run_1',
    dryRunRecordId: 'github_branch_publish_plan_1',
    approvalRequestId: 'github_branch_publish_approval_request_1',
    approvalArtifactId: 'github_branch_publish_approval_artifact_1',
    status: 'approved',
    approved: true,
    policyDecisionId: 'github_branch_publish_policy_1',
    requestedByHash: 'sha256:operator',
    decidedByHash: 'sha256:approver',
    reasonHash: 'sha256:reason',
    evidenceRefs: [],
    auditEventIds: ['audit_github_branch_publish_approval_1'],
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      dryRunIdHash: 'sha256:dry-run',
      approvalArtifactIdHash: 'sha256:artifact',
      status: 'approved',
    },
    summary: 'GitHub branch publish approval fixture stores hashes only.',
  };
}

function createGithubBranchPublishRunFixture(
  plan: GithubBranchPublishPlan,
): GithubBranchPublishRun {
  return {
    id: 'github_branch_publish_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-05T00:00:02.000Z',
    dryRunId: 'github_branch_publish_dry_run_1',
    dryRunRecordId: 'github_branch_publish_plan_1',
    approvalArtifactId: 'github_branch_publish_approval_artifact_1',
    status: 'completed',
    plan,
    commitSummary: {
      id: 'github_branch_publish_commit_summary_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-05-05T00:00:02.000Z',
      targetRef: plan.readiness.targetRef,
      commitShaHash: 'sha256:commit',
      treeShaHash: 'sha256:tree',
      branchNameHash: 'sha256:branch',
      contentManifestHash: 'sha256:manifest',
      fileCount: 1,
      created: true,
      createRefAllowed: true,
      updateRefAllowed: false,
      forceAllowed: false,
      pushAllowed: false,
      mergeAllowed: false,
      rawFileContentStored: false,
      rawPathStored: false,
      bodyStored: false,
      metadata: {
        integration: 'github-provider',
        commitShaHash: 'sha256:commit',
        treeShaHash: 'sha256:tree',
      },
      summary: 'GitHub branch publish commit summary stores remote identifiers as hashes only.',
    } satisfies GithubRemoteCommitSummary,
    responseBodyHashes: [
      'sha256:repo',
      'sha256:base-ref',
      'sha256:branch-ref',
      'sha256:base-commit',
      'sha256:blob',
      'sha256:tree',
      'sha256:commit',
      'sha256:ref',
    ],
    blockReasons: [],
    evidenceRefs: [],
    auditEventIds: ['audit_github_branch_publish_run_1'],
    networkBoundaryInvoked: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: false,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      integration: 'github-provider',
      dryRunIdHash: 'sha256:dry-run',
      status: 'completed',
      networkBoundaryInvoked: true,
    },
    summary: 'GitHub branch publish run fixture completed with hash-only output.',
  };
}

function createProductionWorkflowRecoveryPlanFixture(): ProductionWorkflowRecoveryPlan {
  return {
    id: 'production_workflow_recovery_plan_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:23.000Z',
    dryRunId: 'production_workflow_recovery_dry_run_1',
    templateId: 'local-patch-review',
    templateHash: 'sha256:production-template',
    sourceRunIdHash: 'sha256:source-run',
    status: 'planned',
    childActionPlans: [
      {
        actionId: 'child_action_worktree',
        stepId: 'worktree',
        stepKind: 'worktree',
        childActionKind: 'worktree-create',
        childControlPlane: 'worktrees',
        actionMode: 'write',
        riskLevel: 'high',
        requiresChildApproval: true,
        createsChildDryRun: true,
        createsChildApprovalRequest: true,
        childAutoApprovalAllowed: false,
        childAdapterExecuteAllowed: false,
        hashBindingRequired: true,
        summary: 'Worktree child action is controlled by worktree control plane.',
      },
    ],
    childActionCount: 1,
    approvalRequired: true,
    childApprovalsRequired: 1,
    blockReasons: [],
    evidenceRefIds: ['evidence_recovery_plan_1'],
    auditEventIds: ['audit_recovery_plan_1'],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    childAdapterExecuteAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow recovery plan stores child action metadata only.',
  };
}

function createProductionWorkflowRecoveryApprovalFixture(): ProductionWorkflowRecoveryApprovalArtifact {
  return {
    id: 'production_workflow_recovery_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:24.000Z',
    dryRunId: 'production_workflow_recovery_dry_run_1',
    templateId: 'local-patch-review',
    templateHash: 'sha256:production-template',
    approvalArtifactId: 'production_workflow_recovery_approval_artifact_1',
    status: 'approved',
    approvedBy: 'local-operator',
    reasonHash: 'sha256:reason',
    reasonSummary: 'Reason stored as hash only.',
    childApprovalsIncluded: false,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow recovery approval does not include child approvals.',
  };
}

function createProductionWorkflowRecoveryChildActionStateFixture(): ProductionWorkflowChildActionStateRecord {
  const state: ProductionWorkflowChildActionStateRecord['state'] = {
    actionId: 'child_action_worktree',
    stepId: 'worktree',
    stepKind: 'worktree',
    childActionKind: 'worktree-create',
    childControlPlane: 'worktrees',
    status: 'waiting_for_child_approval',
    childDryRunIdHash: 'sha256:child-dry-run',
    childApprovalRequestIdHash: 'sha256:child-approval-request',
    childHashBindingMatched: true,
    childApprovalRequired: true,
    childApprovalResolvedFromStore: false,
    childAutoApprovalAllowed: false,
    childAdapterExecuteAllowed: false,
    blockReasons: ['production_workflow_child_approval_required:worktree'],
    evidenceRefIds: [],
    auditEventIds: [],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Worktree child action waits for separate child approval.',
  };
  return {
    id: 'production_workflow_recovery_child_action_state_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:26.000Z',
    dryRunId: 'production_workflow_recovery_dry_run_1',
    recoveryRunId: 'production_workflow_recovery_run_1',
    actionId: state.actionId,
    stepId: state.stepId,
    status: state.status,
    state,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow recovery child action state stores metadata only.',
  };
}

function createProductionWorkflowRecoveryRunFixture(): ProductionWorkflowRecoveryRun {
  const childRecord = createProductionWorkflowRecoveryChildActionStateFixture();
  const childState = childRecord.state;
  return {
    id: 'production_workflow_recovery_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-04-28T00:00:25.000Z',
    recoveryRunId: 'production_workflow_recovery_run_1',
    dryRunId: 'production_workflow_recovery_dry_run_1',
    approvalArtifactId: 'production_workflow_recovery_approval_artifact_1',
    templateId: 'local-patch-review',
    templateHash: 'sha256:production-template',
    status: 'waiting_for_child_approval',
    steps: [
      {
        stepId: 'worktree',
        kind: 'worktree',
        status: 'waiting_for_child_approval',
        childActionStates: [childState],
        blockReasons: ['production_workflow_child_approval_required:worktree'],
        evidenceRefIds: [],
        auditEventIds: [],
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        networkBoundaryInvoked: false,
        directAdapterExecutionAllowed: false,
        bodyStored: false,
        rawPathStored: false,
        summary: 'Worktree recovery step waits for child approval.',
      },
    ],
    childActionStates: [childState],
    stepCount: 1,
    childActionCount: 1,
    completedChildActionCount: 0,
    waitingChildApprovalCount: 1,
    failedChildActionCount: 0,
    blockReasons: ['production_workflow_child_approval_required:worktree'],
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
    summary: 'Production workflow recovery run waits for separate child approval.',
  };
}

function createCodexExecLiveRunFixture(): CodexExecLiveRunRecord {
  const createdAt = '2026-04-28T00:00:03.000Z';
  const intent = {
    id: 'codex_intent_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    title: 'Summarize repository structure',
    cwd: '.',
    sandboxMode: 'read_only' as const,
    approvalMode: 'required' as const,
    promptSummary: 'Summarize repository structure',
    promptHash: 'sha256:prompt',
    promptLength: 30,
    promptBodyStored: false as const,
    liveAdapterEnabled: false,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
  };
  const dryRunPlan = {
    id: 'codex_dry_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    intentId: intent.id,
    intent,
    title: intent.title,
    cwd: '.',
    sandboxMode: 'read_only' as const,
    approvalMode: 'required' as const,
    riskLevel: 'medium' as const,
    promptSummary: intent.promptSummary,
    promptHash: intent.promptHash,
    promptLength: intent.promptLength,
    promptBodyStored: false as const,
    liveAdapterEnabled: false,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    summary: 'Dry-run control plan',
  };
  const policyDecision = {
    id: 'policy_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    actionId: dryRunPlan.id,
    actionType: 'codex.exec.live.intent',
    actionMode: 'read' as const,
    riskLevel: 'medium' as const,
    outcome: 'deny' as const,
    reasons: ['disabled'],
    requiresDryRun: true,
    requiresApproval: true,
  };

  return {
    id: 'codex_live_run_1',
    schemaVersion: SchemaVersionSchema.value,
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
      schemaVersion: SchemaVersionSchema.value,
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
      schemaVersion: SchemaVersionSchema.value,
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
      schemaVersion: SchemaVersionSchema.value,
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
  };
}

function createBrowserObservationDryRunFixture(): BrowserObservationDryRunRecord {
  const createdAt = '2026-04-28T00:00:04.100Z';
  const profileRef = {
    id: 'browser_profile_ref_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    profileId: 'supervisor-profile',
    displayName: 'Supervisor profile',
    profilePathHash: 'sha256:profile',
    rawPathStored: false as const,
    readOnly: true as const,
  };
  const plan = {
    id: 'browser_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: 'playwright-observer',
    profileRef,
    requestedCapabilities: ['title' as const, 'url' as const],
    runnerMode: 'controlled-local-browser' as const,
    targetUrlHash: 'sha256:target',
    forbiddenActions: ['click' as const, 'type' as const],
    blockReasons: [],
    screenshotPlanned: false as const,
    networkBodyStorage: 'forbidden' as const,
    rawPathStored: false as const,
    bodyStored: false as const,
    noRealWrite: true as const,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false as const,
    externalProcessStarted: false as const,
    summary: 'Browser dry-run stores target URL hash only.',
  };
  const evidenceRef: EvidenceRef = {
    id: 'browser_evidence_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    kind: 'browser.observation_plan',
    hash: 'sha256:browser-plan',
    summary: 'Browser dry-run metadata only.',
    labels: ['browser.observation.dry_run'],
    redacted: true,
  };

  return {
    id: 'browser_dry_run_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'browser_dry_run_1',
    status: 'ready',
    plan,
    capabilityDryRun: {
      id: 'browser_capability_dry_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      adapterName: 'playwright-observer',
      inputSummary: {
        targetUrlHash: 'sha256:target',
        bodyStored: false,
      },
      plannedActions: [
        {
          action: 'browser.observe.read_only',
          actionMode: 'read',
          risk: 'high',
          target: 'sha256:profile',
          requiresApproval: true,
        },
      ],
      requiredEvidence: [],
      warnings: [],
    },
    policyDecision: {
      id: 'browser_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'browser_plan_1',
      actionType: 'browser.observe.read_only',
      actionMode: 'read',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['high risk action requires explicit approval'],
      requiresDryRun: false,
      requiresApproval: true,
    },
    targetUrlHash: 'sha256:target',
    blockReasons: [],
    timeline: [],
    evidenceRefs: [evidenceRef],
    auditEventIds: ['browser_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Browser observation dry-run persisted as metadata only.',
  };
}

function createBrowserObservationApprovalFixture(): BrowserObservationApprovalArtifactRecord {
  const createdAt = '2026-04-28T00:00:04.200Z';

  return {
    id: 'browser_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'browser_dry_run_1',
    dryRunRecordId: 'browser_dry_run_record_1',
    approvalRequestId: 'browser_approval_request_1',
    approvalArtifactId: 'browser_approval_artifact_1',
    status: 'approved',
    requestedBy: 'local-operator',
    decidedBy: 'local-operator',
    reasonHash: 'sha256:reason',
    decisionReasonHash: 'sha256:decision',
    dryRunPlanHash: 'sha256:dry-run',
    policyDecisionId: 'browser_policy_1',
    policyDecisionHash: 'sha256:policy',
    approved: true,
    requestedAt: createdAt,
    decidedAt: createdAt,
    expiresAt: '2026-04-28T01:00:00.000Z',
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['browser_approval_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Browser approval stores hashes and ids only.',
  };
}

function createBrowserObservationRunFixture(): BrowserObservationControlPlaneRun {
  const createdAt = '2026-04-28T00:00:04.300Z';

  return {
    id: 'browser_control_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'browser_dry_run_1',
    dryRunRecordId: 'browser_dry_run_record_1',
    approvalArtifactId: 'browser_approval_artifact_1',
    status: 'completed',
    planId: 'browser_plan_1',
    targetUrlHash: 'sha256:target',
    timeline: [],
    evidenceRefIds: ['browser_evidence_1'],
    auditEventIds: ['browser_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    summary: 'Browser observation control-plane run completed with boundary truth metadata.',
  };
}

function createElectronCdpObservationDryRunFixture(): ElectronCdpObservationDryRunRecord {
  const createdAt = '2026-04-28T00:00:04.400Z';
  const debugEndpoint = {
    id: 'electron_endpoint_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    endpointIdHash: 'sha256:endpoint',
    hostHash: 'sha256:host',
    portHash: 'sha256:port',
    protocol: 'cdp' as const,
    loopbackOnly: true as const,
    userEnabled: true,
    mainInspectorEnabled: false as const,
    runtimeEvaluateAllowed: false as const,
    genericCommandPassthrough: false as const,
    rawPathStored: false as const,
    bodyStored: false as const,
    noRealWrite: true as const,
    processBoundaryInvoked: false as const,
    externalProcessStarted: false as const,
    summary: 'Electron debug endpoint summary stores hashes only.',
  };
  const plan = {
    id: 'electron_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: 'electron-cdp',
    runnerMode: 'controlled-websocket-events' as const,
    debugEndpoint,
    targetIdHash: 'sha256:target',
    targets: [],
    requestedCapabilities: ['debug_endpoint_summary' as const, 'target_summary' as const],
    forbiddenActions: [],
    blockReasons: [],
    commandDecisions: [],
    mainInspectorEnabled: false as const,
    runtimeEvaluateAllowed: false as const,
    genericCommandPassthrough: false as const,
    screenshotPlanned: false as const,
    domSnapshotPlanned: false as const,
    networkBodyStorage: 'forbidden' as const,
    rawPathStored: false as const,
    bodyStored: false as const,
    noRealWrite: true as const,
    observationWindowMs: 5_000,
    cdpHttpBoundaryPlanned: true,
    cdpHttpBoundaryInvoked: false as const,
    cdpWebSocketBoundaryPlanned: true,
    cdpWebSocketBoundaryInvoked: false as const,
    processBoundaryPlanned: false as const,
    processBoundaryInvoked: false as const,
    externalProcessStarted: false as const,
    summary: 'Electron/CDP controlled HTTP dry-run stores endpoint hashes only.',
  };
  const evidenceRef: EvidenceRef = {
    id: 'electron_evidence_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    kind: 'electron.observation_plan',
    hash: 'sha256:electron-plan',
    summary: 'Electron/CDP dry-run metadata only.',
    labels: ['electron.cdp.observation.dry_run'],
    redacted: true,
  };

  return {
    id: 'electron_dry_run_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'electron_dry_run_1',
    status: 'ready',
    plan,
    capabilityDryRun: {
      id: 'electron_capability_dry_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      adapterName: 'electron-cdp',
      inputSummary: {
        endpointIdHash: 'sha256:endpoint',
        bodyStored: false,
      },
      plannedActions: [
        {
          action: 'electron.cdp.observe.read_only',
          actionMode: 'read',
          risk: 'medium',
          target: 'sha256:endpoint',
          requiresApproval: true,
        },
      ],
      requiredEvidence: [],
      warnings: [],
    },
    policyDecision: {
      id: 'electron_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'electron_plan_1',
      actionType: 'electron.cdp.observe.read_only',
      actionMode: 'read',
      riskLevel: 'medium',
      outcome: 'approval_required',
      reasons: ['controlled local CDP event observation requires explicit approval'],
      requiresDryRun: true,
      requiresApproval: true,
    },
    endpointIdHash: 'sha256:endpoint',
    endpointHostHash: 'sha256:host',
    endpointPortHash: 'sha256:port',
    targetIdHash: 'sha256:target',
    blockReasons: [],
    timeline: [],
    evidenceRefs: [evidenceRef],
    auditEventIds: ['electron_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryPlanned: true,
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryPlanned: true,
    cdpWebSocketBoundaryInvoked: false,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron/CDP observation dry-run persisted as metadata only.',
  };
}

function createElectronCdpObservationApprovalFixture(): ElectronCdpObservationApprovalArtifactRecord {
  const createdAt = '2026-04-28T00:00:04.500Z';

  return {
    id: 'electron_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'electron_dry_run_1',
    dryRunRecordId: 'electron_dry_run_record_1',
    approvalRequestId: 'electron_approval_request_1',
    approvalArtifactId: 'electron_approval_artifact_1',
    status: 'approved',
    requestedBy: 'local-operator',
    decidedBy: 'local-operator',
    reasonHash: 'sha256:reason',
    decisionReasonHash: 'sha256:decision',
    dryRunPlanHash: 'sha256:electron-dry-run',
    policyDecisionId: 'electron_policy_1',
    policyDecisionHash: 'sha256:electron-policy',
    approved: true,
    requestedAt: createdAt,
    decidedAt: createdAt,
    expiresAt: '2026-04-28T01:00:00.000Z',
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['electron_approval_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron/CDP approval stores hashes and ids only.',
  };
}

function createElectronCdpObservationRunFixture(): ElectronCdpObservationControlPlaneRun {
  const createdAt = '2026-04-28T00:00:04.600Z';

  return {
    id: 'electron_control_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'electron_dry_run_1',
    dryRunRecordId: 'electron_dry_run_record_1',
    approvalArtifactId: 'electron_approval_artifact_1',
    status: 'completed',
    planId: 'electron_plan_1',
    endpointIdHash: 'sha256:endpoint',
    targetIdHash: 'sha256:target',
    timeline: [],
    evidenceRefIds: ['electron_evidence_1'],
    auditEventIds: ['electron_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: true,
    cdpWebSocketBoundaryInvoked: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron/CDP control-plane run completed with event boundary metadata.',
  };
}

function createWorktreeDryRunFixture(): WorktreeDryRunRecord {
  const createdAt = '2026-04-28T00:00:04.700Z';
  const plan = {
    id: 'worktree_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: 'worktree-manager',
    status: 'planned' as const,
    runnerMode: 'controlled-git-worktree' as const,
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    branchNameHash: 'sha256:branch',
    worktreeSlugHash: 'sha256:slug',
    baseRefHash: 'sha256:base',
    commandSummaryHash: 'sha256:command',
    defaultRootKind: 'sibling' as const,
    plannedActions: [
      {
        action: 'git.worktree.create.real',
        actionMode: 'write' as const,
        risk: 'high' as const,
        target: 'sha256:path',
        requiresApproval: true,
      },
    ],
    rawPathStored: false as const,
    bodyStored: false as const,
    noRealWrite: true as const,
    gitProcessBoundaryPlanned: true,
    gitProcessBoundaryInvoked: false as const,
    cleanupRequired: false,
    cleanupDeferred: false,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false as const,
    externalProcessStarted: false as const,
    blockReasons: [],
    summary: 'Controlled git worktree dry-run.',
  };

  return {
    id: 'worktree_dry_run_record_1',
    dryRunId: 'worktree_dry_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    status: 'ready',
    plan,
    capabilityDryRun: {
      id: 'worktree_capability_dry_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      adapterName: 'worktree-manager',
      inputSummary: {
        worktreePathHash: 'sha256:path',
      },
      plannedActions: plan.plannedActions,
      requiredEvidence: ['worktree.plan'],
      warnings: [],
    },
    policyDecision: {
      id: 'worktree_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'worktree_plan_1',
      actionType: 'git.worktree.create',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['real write action requires explicit approval'],
      requiresDryRun: true,
      requiresApproval: true,
    },
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    branchNameHash: 'sha256:branch',
    worktreeSlugHash: 'sha256:slug',
    baseRefHash: 'sha256:base',
    blockReasons: [],
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['worktree_dry_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    gitProcessBoundaryPlanned: true,
    gitProcessBoundaryInvoked: false,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Worktree dry-run stores hash metadata only.',
  };
}

function createWorktreeApprovalFixture(): WorktreeApprovalArtifactRecord {
  const createdAt = '2026-04-28T00:00:04.800Z';

  return {
    id: 'worktree_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'worktree_dry_run_1',
    dryRunRecordId: 'worktree_dry_run_record_1',
    approvalRequestId: 'worktree_approval_request_1',
    approvalArtifactId: 'worktree_approval_artifact_1',
    status: 'approved',
    requestedBy: 'local-operator',
    decidedBy: 'local-operator',
    dryRunPlanHash: 'sha256:plan',
    policyDecisionId: 'worktree_policy_1',
    policyDecisionHash: 'sha256:policy',
    approved: true,
    requestedAt: createdAt,
    decidedAt: createdAt,
    expiresAt: '2026-04-28T01:00:00.000Z',
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['worktree_approval_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    gitProcessBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Worktree approval stores hashes and ids only.',
  };
}

function createWorktreeRunFixture(): WorktreeControlPlaneRun {
  const createdAt = '2026-04-28T00:00:04.900Z';

  return {
    id: 'worktree_control_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'worktree_dry_run_1',
    dryRunRecordId: 'worktree_dry_run_record_1',
    approvalArtifactId: 'worktree_approval_artifact_1',
    status: 'completed',
    planId: 'worktree_plan_1',
    runnerMode: 'controlled-git-worktree',
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    branchNameHash: 'sha256:branch',
    worktreeSlugHash: 'sha256:slug',
    baseRefHash: 'sha256:base',
    changedFileCount: 1,
    diffHash: 'sha256:diff',
    timeline: [],
    evidenceRefIds: ['worktree_evidence_1'],
    auditEventIds: ['worktree_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: false,
    cleanupRequired: true,
    cleanupDeferred: true,
    gitProcessBoundaryInvoked: true,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    summary: 'Worktree control-plane run completed with git boundary metadata.',
  };
}

function createWorktreeCleanupDryRunFixture(): WorktreeCleanupDryRunRecord {
  const createdAt = '2026-04-28T00:00:05.000Z';
  const plan: WorktreeCleanupDryRunRecord['plan'] = {
    id: 'worktree_cleanup_plan_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: 'worktree-manager',
    sourceRunId: 'worktree_control_run_1',
    status: 'planned' as const,
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    sourceRunHash: 'sha256:source-run',
    commandSummaryHash: 'sha256:cleanup-command',
    blockReasons: [],
    plannedActions: [
      {
        action: 'git.worktree.cleanup.remove',
        actionMode: 'write' as const,
        risk: 'high' as const,
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
    summary: 'Worktree cleanup dry-run stores hash metadata only.',
  };

  return {
    id: 'worktree_cleanup_dry_run_record_1',
    dryRunId: 'worktree_cleanup_dry_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    sourceRunId: 'worktree_control_run_1',
    status: 'ready',
    plan,
    capabilityDryRun: {
      id: 'worktree_cleanup_capability_dry_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      adapterName: 'worktree-manager',
      inputSummary: {
        worktreePathHash: 'sha256:path',
      },
      plannedActions: plan.plannedActions,
      requiredEvidence: ['worktree.cleanup_plan'],
      warnings: [],
    },
    policyDecision: {
      id: 'worktree_cleanup_policy_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      actionId: 'worktree_cleanup_plan_1',
      actionType: 'git.worktree.cleanup',
      actionMode: 'write',
      riskLevel: 'high',
      outcome: 'approval_required',
      reasons: ['cleanup requires approval'],
      requiresDryRun: true,
      requiresApproval: true,
    },
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    sourceRunHash: 'sha256:source-run',
    blockReasons: [],
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['worktree_cleanup_dry_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    gitProcessBoundaryPlanned: true,
    gitProcessBoundaryInvoked: false,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Worktree cleanup dry-run stores hash metadata only.',
  };
}

function createWorktreeCleanupApprovalFixture(): WorktreeCleanupApprovalArtifactRecord {
  const createdAt = '2026-04-28T00:00:05.100Z';

  return {
    id: 'worktree_cleanup_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'worktree_cleanup_dry_run_1',
    dryRunRecordId: 'worktree_cleanup_dry_run_record_1',
    sourceRunId: 'worktree_control_run_1',
    approvalRequestId: 'worktree_cleanup_approval_request_1',
    approvalArtifactId: 'worktree_cleanup_approval_artifact_1',
    status: 'approved',
    requestedBy: 'local-operator',
    decidedBy: 'local-operator',
    dryRunPlanHash: 'sha256:cleanup-plan',
    policyDecisionId: 'worktree_cleanup_policy_1',
    policyDecisionHash: 'sha256:cleanup-policy',
    approved: true,
    requestedAt: createdAt,
    decidedAt: createdAt,
    expiresAt: '2026-04-28T01:00:05.100Z',
    timeline: [],
    evidenceRefs: [],
    auditEventIds: ['worktree_cleanup_approval_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    gitProcessBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Worktree cleanup approval stores hashes and ids only.',
  };
}

function createWorktreeCleanupRunFixture(): WorktreeCleanupControlPlaneRun {
  const createdAt = '2026-04-28T00:00:05.200Z';

  return {
    id: 'worktree_cleanup_control_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'worktree_cleanup_dry_run_1',
    dryRunRecordId: 'worktree_cleanup_dry_run_record_1',
    sourceRunId: 'worktree_control_run_1',
    approvalArtifactId: 'worktree_cleanup_approval_artifact_1',
    status: 'completed',
    planId: 'worktree_cleanup_plan_1',
    repoRootHash: 'sha256:repo',
    worktreeRootHash: 'sha256:root',
    worktreePathHash: 'sha256:path',
    sourceRunHash: 'sha256:source-run',
    dirtyFileCount: 0,
    cleanupAttempted: true,
    cleanupCompleted: true,
    cleanupRequired: false,
    cleanupDeferred: false,
    timeline: [],
    evidenceRefIds: ['worktree_cleanup_evidence_1'],
    auditEventIds: ['worktree_cleanup_run_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: false,
    gitProcessBoundaryInvoked: true,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    summary: 'Worktree cleanup completed with git boundary metadata.',
  };
}

function createCodexExecApprovalRecordFixture(): CodexExecManualApprovalRecord {
  const createdAt = '2026-04-28T00:00:04.000Z';

  return {
    id: 'codex_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    request: {
      id: 'codex_approval_request_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status: 'pending',
      riskLevel: 'medium',
      requestedBy: 'local-human',
      reason: 'approval request reason (21 chars, hash sha256:reason)',
      expiresAt: '2026-04-28T01:00:00.000Z',
      singleUse: true,
      summary: 'Manual approval requested',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    decision: {
      id: 'codex_approval_decision_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      policyDecisionId: 'policy_1',
      outcome: 'approved',
      decidedBy: 'local-human',
      reasonSummary: 'approval decision reason (21 chars, hash sha256:decision)',
      decisionHash: 'sha256:decision',
      approved: true,
      summary: 'Manual approval approved',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    approvalArtifact: {
      id: 'codex_approval_artifact_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status: 'approved',
      expiresAt: '2026-04-28T01:00:00.000Z',
      singleUse: true,
      revoked: false,
      summary: 'Manual approval artifact',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    status: 'approved',
    evidenceRefs: [],
    auditEventIds: [],
    summary: 'Manual approval record',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };
}

function createCodexReportReviewFixture(): CodexExecReportReviewRecord {
  const createdAt = '2026-04-28T00:00:05.000Z';

  return {
    id: 'codex_report_review_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    reportId: 'codex_report_1',
    reportHash: 'sha256:report',
    reportSectionHashes: ['sha256:overview'],
    sectionSummaryRefs: ['overview:codex_report_section_1'],
    reviewedAt: createdAt,
    reviewerLabel: 'local-operator',
    status: 'reviewed',
    recommendation: 'ready_for_adr',
    recommendationGrantsExecution: false,
    riskClassification: 'medium',
    checklistItems: [
      {
        id: 'codex_report_review_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'no_live_flags_present',
        label: 'No-live flags are present',
        status: 'passed',
        required: true,
        summary: 'No-live flags are present.',
        relatedSection: 'no_live_boundary',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    ],
    findings: [],
    notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };
}

function createCodexExecLiveAdapterAdrDecisionFixture(): CodexExecLiveAdapterAdrDecisionRecord {
  const createdAt = '2026-04-28T00:00:06.000Z';
  const gatePolicy = {
    id: 'codex_live_adapter_adr_gate_policy_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    allowedSandboxModes: ['read_only' as const],
    forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
    triggerSurface: 'cli_only' as const,
    dashboardTriggerAllowed: false as const,
    dryRunRequired: true as const,
    approvalArtifactRequired: true as const,
    dryRunPlanHashMatchRequired: true as const,
    policyDecisionHashMatchRequired: true as const,
    isolatedWorktreeRequired: true as const,
    postRunVerificationCommand: 'pnpm verify:foundation' as const,
    evidenceRequired: true as const,
    auditRequired: true as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    recommendationGrantsExecution: false as const,
    metadataOnly: true as const,
    bodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
  };

  return {
    id: 'codex_live_adapter_adr_decision_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    adrDocumentPath: 'docs/adr/round-3n-live-adapter-adr.md',
    decisionDocumentPath: 'docs/adr/round-3n-go-no-go-decision.md',
    decision: 'conditional_read_only_go',
    status: 'recorded',
    reviewerLabel: 'local-operator',
    rationaleSummary: 'Conditional read-only design can continue; implementation is not approved.',
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
    evidenceRefs: [],
    auditEventIds: ['audit_adr_decision_1'],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };
}

function createReadOnlyAdapterSimulatorReviewFixture(): CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord {
  const createdAt = '2026-04-28T00:00:07.000Z';

  return {
    id: 'codex_read_only_adapter_simulator_review_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    simulationId: 'codex_read_only_adapter_preflight_simulation_1',
    simulationStatus: 'failed',
    outcome: 'go_to_implementation_planning',
    status: 'recorded',
    reviewerLabel: 'local-operator',
    rationaleSummary:
      'Simulator review allows implementation planning only; implementation remains unapproved.',
    reviewedAt: createdAt,
    checklistItems: [
      {
        id: 'codex_read_only_adapter_simulator_review_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'sandbox_must_be_read_only',
        label: 'Sandbox must be read only',
        disposition: 'hard_gate',
        status: 'passed',
        required: true,
        summary: 'Future adapter planning must keep sandbox read-only.',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      {
        id: 'codex_read_only_adapter_simulator_review_check_2',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'separate_future_adr_required',
        label: 'Separate future ADR required',
        disposition: 'hard_gate',
        status: 'passed',
        required: true,
        summary: 'Round 3Q does not approve implementation.',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
    ],
    findings: [],
    simulatorBlockers: [],
    hardGateCount: 2,
    requiresReviewCount: 0,
    informationalCount: 0,
    unresolvedBlockerCount: 0,
    evidenceRefs: [],
    auditEventIds: ['audit_simulator_review_1'],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
  };
}

function createReadOnlyAdapterImplementationPlanReviewFixture(): CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord {
  const createdAt = '2026-04-28T00:00:08.000Z';

  return {
    id: 'codex_read_only_adapter_implementation_plan_review_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planDocumentPath: 'docs/design/round-3r-read-only-adapter-implementation-plan.md',
    planDocumentHash: 'sha256:implementation-plan',
    outcome: 'conditional_go_to_disabled_skeleton',
    status: 'recorded',
    reviewerLabel: 'local-operator',
    rationaleSummary:
      'Allows only a disabled-by-default skeleton; process adapter and execution remain unapproved.',
    reviewedAt: createdAt,
    disabledSkeletonApproved: true,
    checklistItems: [
      {
        id: 'codex_read_only_adapter_implementation_plan_review_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'read_only_only',
        label: 'Read-only only',
        status: 'passed',
        required: true,
        disposition: 'hard_gate',
        summary: 'The plan allows only read_only future scope.',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
      },
    ],
    findings: [],
    hardGateCount: 1,
    requiresReviewCount: 0,
    informationalCount: 0,
    unresolvedFindingCount: 0,
    evidenceRefs: [],
    auditEventIds: ['audit_implementation_plan_review_1'],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    implementationApproved: false,
  };
}

function createReadOnlyAdapterSkeletonReviewFixture(): CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord {
  const createdAt = '2026-04-28T00:00:09.000Z';

  return {
    id: 'codex_read_only_adapter_skeleton_review_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    skeletonPreviewId: 'codex_read_only_adapter_skeleton_preview_1',
    outcome: 'skeleton_accepted_for_fixture_boundary_only',
    status: 'recorded',
    reviewerLabel: 'local-operator',
    rationaleSummary: 'Disabled skeleton accepted only for a fixture-backed replay boundary.',
    reviewedAt: createdAt,
    fixtureBoundaryAllowed: true,
    checklistItems: [
      {
        id: 'codex_read_only_adapter_skeleton_review_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'skeleton_disabled',
        label: 'Skeleton is disabled',
        disposition: 'hard_gate',
        status: 'passed',
        required: true,
        summary: 'Skeleton remains disabled and non-executing.',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
      },
    ],
    findings: [],
    hardGateCount: 1,
    requiresReviewCount: 0,
    informationalCount: 0,
    unresolvedFindingCount: 0,
    evidenceRefs: [],
    auditEventIds: ['audit_skeleton_review_1'],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
  };
}

function createReadOnlyAdapterFinalReadinessFixture(): CodexExecReadOnlyAdapterFinalReadinessDecisionRecord {
  const createdAt = '2026-04-28T00:00:10.000Z';

  return {
    id: 'codex_read_only_adapter_final_readiness_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    outcome: 'ready_for_separate_read_only_adapter_adr',
    status: 'recorded',
    reviewerLabel: 'local-operator',
    rationaleSummary:
      'Separate ADR is required before any real read-only adapter can be considered.',
    reviewedAt: createdAt,
    phaseAStatus: 'disabled',
    phaseBOutcome: 'skeleton_accepted_for_fixture_boundary_only',
    phaseCStatus: 'completed',
    realAdapterRequiresSeparateAdr: true,
    currentRoundApprovesProcessStart: false,
    currentRoundApprovesCodexExecution: false,
    currentRoundApprovesWorkspaceWrites: false,
    evidenceRefs: [],
    auditEventIds: ['audit_final_readiness_1'],
    summary: 'Ready only for a separate real read-only adapter ADR.',
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
  };
}

function createRealReadOnlyAdapterReadinessFixture(): CodexExecRealReadOnlyAdapterReadinessPackage {
  const createdAt = '2026-04-28T00:00:11.000Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };

  return {
    id: 'codex_real_read_only_adapter_readiness_package_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    status: 'requires_review',
    recommendation:
      'Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.',
    governanceDecisionId: 'codex_read_only_adapter_implementation_plan_review_1',
    skeletonReviewId: 'codex_read_only_adapter_skeleton_review_1',
    finalReadinessId: 'codex_read_only_adapter_final_readiness_1',
    documentedArtifactRefs: ['docs/reviews/round-3tw-additional-rules-audit.md'],
    gates: [
      {
        id: 'codex_real_read_only_adapter_readiness_gate_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'fixture_path_guard_symlink_escape',
        label: 'Fixture path guard symlink escape',
        category: 'fixture_boundary',
        disposition: 'requires_review',
        status: 'requires_review',
        required: true,
        summary: 'Symlink escape verification remains pending.',
        ...flags,
      },
    ],
    blockers: [],
    findings: [
      {
        id: 'codex_real_read_only_adapter_readiness_finding_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'documented_only_3tw_evidence',
        severity: 'medium',
        status: 'requires_review',
        summary: 'Round 3T-W evidence is documented-only.',
        recommendation: 'Treat this package as requires_review until persisted evidence exists.',
        ...flags,
      },
    ],
    checklistItems: [
      {
        id: 'codex_real_read_only_adapter_readiness_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'separate_adr_required',
        label: 'Separate ADR required',
        status: 'passed',
        required: true,
        summary: 'Separate ADR remains required before implementation can be considered.',
        ...flags,
      },
    ],
    hardGateCount: 1,
    passedGateCount: 0,
    requiresReviewCount: 1,
    blockerCount: 0,
    findingCount: 1,
    documentedOnly3twEvidence: true,
    symlinkEscapeVerificationPending: true,
    evidenceRefs: [],
    auditEventIds: ['audit_real_readiness_1'],
    summary: 'Readiness requires review before any separate ADR.',
    ...flags,
  };
}

function createRealReadOnlyAdapterReadinessReviewFixture(): CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord {
  const createdAt = '2026-04-28T00:00:12.000Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };

  return {
    id: 'codex_real_read_only_adapter_readiness_review_1',
    schemaVersion: SchemaVersionSchema.value,
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
    checklistItems: [
      {
        id: 'codex_real_read_only_adapter_readiness_review_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'unresolved_findings_acknowledged',
        label: 'Unresolved findings acknowledged',
        status: 'passed',
        required: true,
        summary: 'Required finding codes were acknowledged.',
        ...flags,
      },
    ],
    findings: [
      {
        id: 'codex_real_read_only_adapter_readiness_review_finding_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'documented_only_3tw_evidence',
        severity: 'medium',
        status: 'requires_review',
        relatedReadinessFindingId: 'codex_real_read_only_adapter_readiness_finding_1',
        relatedReadinessFindingCode: 'documented_only_3tw_evidence',
        summary: 'Round 3T-W evidence is documented-only.',
        recommendation: 'Documented-only evidence must be explicitly acknowledged.',
        ...flags,
      },
    ],
    evidenceRefs: [],
    auditEventIds: ['audit_real_readiness_review_1'],
    summary:
      'ADR drafting only. Does not grant implementation, process launch, or execution permission.',
    ...flags,
  };
}

function createRealReadOnlyAdapterAttemptFixture(): CodexExecRealReadOnlyAdapterAttemptRecord {
  const createdAt = '2026-04-28T00:00:13.000Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    promptBodyStored: false as const,
    commandBodyStored: false as const,
    stdoutBodyStored: false as const,
    stderrBodyStored: false as const,
    agentMessageBodyStored: false as const,
    reasoningBodyStored: false as const,
    argvStored: false as const,
    executablePathStored: false as const,
    shellSnippetStored: false as const,
    envPlanStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };

  return {
    id: 'codex_real_read_only_adapter_attempt_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    requestId: 'codex_real_read_only_adapter_request_1',
    preflightId: 'codex_real_read_only_adapter_preflight_1',
    resultId: 'codex_real_read_only_adapter_result_1',
    status: 'blocked',
    authoritative: true,
    supervisorBacked: true,
    persisted: true,
    degraded: false,
    notPersisted: false,
    processBoundaryInvoked: false,
    preflightStatus: 'passed',
    resultStatus: 'not_started',
    resultErrorCode: 'boundary_deferred',
    failedCheckCodes: [],
    blockedCheckCodes: [],
    boundaryDeferredReasonCode: 'executable_resolution_blocked',
    boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
    boundaryDeferredDiagnostics: {
      id: 'codex_real_read_only_adapter_boundary_deferred_diagnostics_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      reasonCode: 'executable_resolution_blocked',
      reasonCodes: ['executable_resolution_blocked'],
      preflightStatus: 'passed',
      runtimeWorktreeProvided: true,
      approvalInputProvided: true,
      governedInputProvided: true,
      governedInputVerified: true,
      governedInputContentHash: 'sha256:governed-input',
      executableResolutionStatus: 'blocked',
      executableResolutionReasonCode: 'executable_inaccessible',
      cwdSelfCheckStatus: 'passed',
      sourcePreparationReady: true,
      prerequisiteReady: true,
      worktreePathHashMatched: true,
      processBoundaryReady: false,
      summary: 'Boundary deferred diagnostics stores metadata only.',
      metadata: {
        metadataOnly: true,
        source: 'store-sqlite-test-boundary-deferred',
        worktreePathStored: false,
        executablePathStored: false,
        argvStored: false,
        envPlanStored: false,
      },
      metadataOnly: true,
      bodyStored: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
    },
    boundaryDiagnosticsComplete: false,
    boundaryDiagnosticsMissingFields: [],
    postRunVerificationStatus: 'not_required',
    workspaceMutationDetected: false,
    evidenceRefIds: ['evidence_real_read_only_adapter_attempt_1'],
    auditEventIds: ['audit_real_read_only_adapter_attempt_1'],
    outputHashCount: 0,
    metadataHash: 'sha256:attempt_metadata',
    summary: 'Boundary deferred supervisor attempt stores metadata-only diagnostics.',
    metadata: {
      source: 'store-sqlite-test',
      metadataOnly: true,
      runtimeWorktreeProvided: true,
      approvalInputProvided: true,
      executableResolutionStatus: 'blocked',
      executableResolutionReasonCode: 'executable_inaccessible',
      cwdSelfCheckStatus: 'passed',
      sourcePreparationReady: true,
      prerequisiteReady: true,
      worktreePathHashMatched: true,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      worktreePathStored: false,
    },
    ...flags,
  };
}

function createRealReadOnlyAdapterFailedAttemptFixture(): CodexExecRealReadOnlyAdapterAttemptRecord {
  const base = createRealReadOnlyAdapterAttemptFixture();

  return {
    ...base,
    id: 'codex_real_read_only_adapter_attempt_failed_1',
    createdAt: '2026-04-28T00:00:12.500Z',
    status: 'failed',
    processBoundaryInvoked: true,
    processBoundaryModuleRef: 'packages/codex-kernel/src/real-read-only-adapter-process.ts',
    preflightStatus: 'passed',
    resultStatus: 'failed',
    resultErrorCode: 'boundary_failed',
    failedCheckCodes: [],
    boundaryDeferredReasonCode: undefined,
    boundaryDeferredReasonCodes: [],
    boundaryDeferredDiagnostics: undefined,
    boundaryDiagnosticsComplete: true,
    boundaryDiagnosticsMissingFields: [],
    boundaryDiagnostics: {
      id: 'codex_real_read_only_adapter_boundary_diagnostics_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:12.500Z',
      status: 'failed',
      failureCode: 'process_exit_nonzero',
      exitCode: 2,
      startFailureKind: 'none',
      platform: 'win32',
      resolvedExecutableKind: 'native_exe',
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
      cwdHash: 'sha256:cwd',
      cwdExists: true,
      cwdIsDirectory: true,
      executableExists: true,
      executableAccessible: true,
      envAllowlistKeyCount: 6,
      envAllowlistKeyHash: 'sha256:env_keys',
      externalProcessStarted: true,
      summary: 'Boundary diagnostics stores hashes and counts only.',
      metadataOnly: true,
      bodyStored: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
      liveExecution: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
    },
    postRunVerificationStatus: 'skipped',
    postRunVerificationSkipReason: 'attempt_not_completed',
    outputHashCount: 2,
    metadataHash: 'sha256:attempt_failed_metadata',
    summary: 'Failed supervisor attempt stores boundary diagnostics metadata only.',
  };
}

function createRealReadOnlyAdapterApprovalAuthorityTraceFixture(): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord {
  const createdAt = '2026-04-28T00:00:13.500Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    promptBodyStored: false as const,
    commandBodyStored: false as const,
    stdoutBodyStored: false as const,
    stderrBodyStored: false as const,
    agentMessageBodyStored: false as const,
    reasoningBodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };

  return {
    id: 'codex_real_read_only_adapter_approval_authority_trace_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
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
    expiresAt: '2026-04-28T01:00:00.000Z',
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
    auditEventIds: ['audit_real_read_only_adapter_approval_authority_trace_1'],
    summary: 'Approval authority trace stores metadata only.',
    metadata: {
      source: 'store-sqlite-test',
      metadataOnly: true,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      worktreePathStored: false,
    },
    ...flags,
  };
}

function createRealReadOnlyAdapterPilotPrerequisiteFixture(): CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord {
  const createdAt = '2026-04-28T00:00:14.000Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    promptBodyStored: false as const,
    commandBodyStored: false as const,
    stdoutBodyStored: false as const,
    stderrBodyStored: false as const,
    agentMessageBodyStored: false as const,
    reasoningBodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };
  const gate = {
    id: 'codex_real_read_only_adapter_pilot_prerequisite_gate_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    code: 'config_explicitly_enabled',
    label: 'Config explicitly enabled',
    category: 'config' as const,
    status: 'blocked' as const,
    required: true,
    summary: 'Config is inspected only and remains disabled.',
    ...flags,
  };

  return {
    id: 'codex_real_read_only_adapter_pilot_prerequisite_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    status: 'blocked',
    recommendation: 'Pilot retry remains blocked until prerequisites are present.',
    gates: [gate],
    blockers: [
      {
        id: 'codex_real_read_only_adapter_pilot_prerequisite_blocker_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: 'missing_config_explicitly_enabled',
        severity: 'high',
        relatedGateCode: gate.code,
        summary: gate.summary,
        recommendation: 'Record explicit config enablement before pilot retry.',
        ...flags,
      },
    ],
    findings: [],
    checklistItems: [
      {
        id: 'codex_real_read_only_adapter_pilot_prerequisite_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: gate.code,
        label: gate.label,
        status: gate.status,
        required: gate.required,
        summary: gate.summary,
        ...flags,
      },
    ],
    hardGateCount: 1,
    passedGateCount: 0,
    blockedGateCount: 1,
    requiresReviewFindingCount: 0,
    missingPrerequisites: ['config_explicitly_enabled'],
    degraded: false,
    notPersisted: false,
    dryRunRecordPresent: true,
    configExplicitlyEnabled: false,
    validUnusedApprovalPresent: false,
    isolatedCleanWorktreeMetadataPresent: false,
    authoritativePolicySourcePresent: false,
    authoritativeSourcePreparationPresent: false,
    authoritativeAttemptEvidencePresent: false,
    evidenceAuditReady: false,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
    authoritative: true,
    supervisorBacked: true,
    persisted: true,
    worktreeLabel: 'operator-isolated-worktree',
    worktreeStatus: 'missing',
    worktreePathHash: 'sha256:worktree',
    evidenceRefs: [],
    auditEventIds: ['audit_real_read_only_adapter_pilot_prerequisite_1'],
    summary: 'Pilot prerequisite record stores metadata only.',
    metadata: {
      source: 'store-sqlite-test',
      worktreePathStored: false,
      metadataOnly: true,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
    },
    ...flags,
  };
}

function createRealReadOnlyAdapterPilotSourcePreparationFixture(): CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord {
  const createdAt = '2026-04-28T00:00:15.000Z';
  const flags = {
    metadataOnly: true as const,
    bodyStored: false as const,
    promptBodyStored: false as const,
    commandBodyStored: false as const,
    stdoutBodyStored: false as const,
    stderrBodyStored: false as const,
    agentMessageBodyStored: false as const,
    reasoningBodyStored: false as const,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    processAdapterStarted: false as const,
    implementationApproved: false as const,
    processAdapterApproved: false as const,
    dashboardTriggerAllowed: false as const,
    recommendationGrantsExecution: false as const,
    workspaceWriteAllowed: false as const,
    dangerFullAccessAllowed: false as const,
  };
  const gate = {
    id: 'codex_real_read_only_adapter_pilot_source_preparation_gate_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    code: 'isolated_clean_worktree_metadata',
    label: 'Isolated clean worktree metadata',
    category: 'worktree' as const,
    status: 'blocked' as const,
    required: true,
    summary: 'Existing isolated worktree metadata is required.',
    ...flags,
  };

  return {
    id: 'codex_real_read_only_adapter_pilot_source_preparation_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'codex_dry_run_1',
    status: 'blocked',
    recommendation: 'Pilot source preparation remains blocked.',
    gates: [gate],
    blockers: [
      {
        id: 'codex_real_read_only_adapter_pilot_source_preparation_blocker_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: gate.code,
        severity: 'high',
        relatedGateCode: gate.code,
        summary: gate.summary,
        recommendation: 'Record isolated clean worktree metadata before 4F.2.',
        ...flags,
      },
    ],
    findings: [],
    checklistItems: [
      {
        id: 'codex_real_read_only_adapter_pilot_source_preparation_check_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt,
        code: gate.code,
        label: gate.label,
        status: gate.status,
        required: gate.required,
        summary: gate.summary,
        ...flags,
      },
    ],
    hardGateCount: 1,
    passedGateCount: 0,
    blockedGateCount: 1,
    requiresReviewFindingCount: 0,
    missingSources: ['isolated_clean_worktree_metadata'],
    degraded: false,
    notPersisted: false,
    dryRunRecordPresent: true,
    configExplicitlyEnabled: true,
    authoritativePolicySourcePresent: false,
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
    auditEventIds: ['audit_real_read_only_adapter_pilot_source_preparation_1'],
    summary: 'Pilot source preparation record stores metadata only.',
    metadata: {
      source: 'store-sqlite-test',
      worktreePathStored: false,
      metadataOnly: true,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
    },
    ...flags,
  };
}

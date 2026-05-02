import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  type AuditEvent,
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
  type EvidenceRef,
  type MockDevelopmentRun,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { createSqliteStore, resolveCodexHubDbPath } from './index';

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
});

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

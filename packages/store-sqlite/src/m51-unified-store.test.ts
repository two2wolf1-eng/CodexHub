import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AccountPoolSchema,
  AdminWriteAuthoritySchema,
  AdminWriteDryRunPlanSchema,
  AdminWriteIntentSchema,
  AdminWriteRunSchema,
  BusinessAdminMemberRosterSnapshotSchema,
  BusinessBillingSummarySchema,
  BusinessMemberReconciliationReportSchema,
  BusinessMembershipMirrorSchema,
  BusinessProfileWorkspaceObservationSchema,
  BusinessWorkspaceSchema,
  BusinessWorkspaceSwitchDryRunPlanSchema,
  BusinessWorkspaceSwitchRunSchema,
  AccountCodexQuotaReadinessSchema,
  ChatGptSessionHealthSchema,
  ChromeProfileBindingSchema,
  ClientPoolSchema,
  AutomationCapabilityPolicySchema,
  BusinessCodexSeatSchema,
  BusinessQuotaCrossCheckReportSchema,
  CdpDomObservationSummarySchema,
  CodexAccountBindingSchema,
  CodexAppServerSessionSchema,
  CodexClientInstanceSchema,
  CodexProductionAuditExportSummarySchema,
  CodexProductionCanaryRunSchema,
  CodexProductionCanaryTaskSchema,
  CodexProductionDriftGateSchema,
  CodexProductionReadinessGateSchema,
  CodexQuotaSourceHealthSchema,
  CodexQuotaFusionReportSchema,
  CodexRecoveryRunSchema,
  CodexSeatUsageLimitSchema,
  CodexTaskClosureRunSchema,
  CodexTaskDiagnosisSchema,
  CodexTaskDiffSummaryProjectionSchema,
  CodexTaskGithubClosureProjectionSchema,
  CodexTaskIntentSchema,
  CodexTaskReviewProjectionSchema,
  CodexTaskRunSchema,
  CodexTaskVerificationProjectionSchema,
  BusinessQuotaPermissionProbeSchema,
  BusinessQuotaSourceProbeSchema,
  ElectronRendererObservationSummarySchema,
  EvidenceBundleSchema,
  ForbiddenPathProbeSchema,
  HumanCheckpointSchema,
  LeaseSchema,
  OwnerAdminExtractionReportSchema,
  OwnerAdminReadSurfaceSummarySchema,
  PrivilegedBusinessAccessLogSchema,
  PrivilegedBusinessDataRecordSchema,
  PrivilegedBusinessExportManifestSchema,
  QuotaAttributionSchema,
  LocalCapabilityProbeSchema,
  QuotaEvidenceMatrixSchema,
  QuotaReadinessDebugReportSchema,
  QuotaSnapshotSchema,
  SensitiveRedactionReportSchema,
  UiTargetFingerprintSchema,
  UiAutomationAuthoritySchema,
  UiAutomationDryRunPlanSchema,
  UiAutomationIntentSchema,
  UiAutomationRunSchema,
  UiObservationSourceSchema,
  WorkspaceCodexQuotaReadinessSchema,
  WorkspaceCreditSnapshotSchema,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import type { MetadataEntityRepository } from '@codexhub/store-core';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

const schemaVersion = SchemaVersionSchema.value;
const createdAt = '2026-05-07T00:00:00.000Z';

async function expectRoundTrip<T extends { id: string }>(
  repository: MetadataEntityRepository<T>,
  record: T,
): Promise<T> {
  await repository.saveRecord(record);
  await expect(repository.getRecord(record.id)).resolves.toEqual(record);
  const records = await repository.listRecords({ limit: 20 });
  expect(records).toContainEqual(record);
  return record;
}

describe('M51 unified metadata store', () => {
  it('round-trips M51 metadata records without raw private payload fields', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m51-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');

    const first = await createSqliteStore({ dbPath });
    const workspace = BusinessWorkspaceSchema.parse({
      id: 'business_workspace_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceIdHash: 'sha256:workspace',
      status: 'active',
      membershipCount: 1,
      ownerCount: 1,
      summary: 'Workspace mirror stores metadata only.',
    });
    const membership = BusinessMembershipMirrorSchema.parse({
      id: 'business_membership_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceIdHash: workspace.workspaceIdHash,
      memberHash: 'sha256:member',
      role: 'owner',
      status: 'active',
      seatActive: true,
      ownerProtected: true,
      summary: 'Membership mirror stores hash, role, and status.',
    });
    const profileBinding = ChromeProfileBindingSchema.parse({
      id: 'chrome_profile_binding_1',
      schemaVersion,
      createdAt,
      profileId: 'profile-default',
      profilePathHash: 'sha256:profile-path',
      accountHash: membership.memberHash,
      workspaceIdHash: workspace.workspaceIdHash,
      summary: 'Chrome profile binding stores a path hash only.',
    });
    const sessionHealth = ChatGptSessionHealthSchema.parse({
      id: 'chatgpt_session_health_1',
      schemaVersion,
      observedAt: createdAt,
      profileBindingId: profileBinding.id,
      accountHash: membership.memberHash,
      workspaceIdHash: workspace.workspaceIdHash,
      status: 'healthy',
      accountMatchesExpected: true,
      workspaceMatchesExpected: true,
      summary: 'Session health stores metadata only.',
    });
    const checkpoint = HumanCheckpointSchema.parse({
      id: 'human_checkpoint_1',
      schemaVersion,
      createdAt,
      checkpointKind: 'login_required',
      status: 'requested',
      targetHash: 'sha256:target',
      summary: 'Human checkpoint stores no credential input.',
    });
    const client = CodexClientInstanceSchema.parse({
      id: 'codex_client_1',
      schemaVersion,
      observedAt: createdAt,
      clientKind: 'codex-app-server',
      clientInstanceHash: 'sha256:client',
      status: 'available',
      activeTaskCount: 0,
      summary: 'Client projection stores metadata only.',
    });
    const appServerSession = CodexAppServerSessionSchema.parse({
      id: 'codex_app_server_session_1',
      schemaVersion,
      observedAt: createdAt,
      clientInstanceId: client.id,
      appServerSessionHash: 'sha256:app-server-session',
      status: 'initialized',
      initialized: true,
      summary: 'App Server session stores a hash only.',
    });
    const accountBinding = CodexAccountBindingSchema.parse({
      id: 'codex_account_binding_1',
      schemaVersion,
      observedAt: createdAt,
      codexAccountHash: 'sha256:codex-account',
      businessMembershipMirrorId: membership.id,
      workspaceIdHash: workspace.workspaceIdHash,
      status: 'matched',
      summary: 'Account binding stores hashes and ids only.',
    });
    const intent = CodexTaskIntentSchema.parse({
      id: 'codex_task_intent_1',
      schemaVersion,
      createdAt,
      intentHash: 'sha256:intent',
      promptHash: 'sha256:prompt',
      promptLength: 12,
      status: 'planned',
      summary: 'Intent stores prompt hash and length only.',
    });
    const taskRun = CodexTaskRunSchema.parse({
      id: 'codex_task_run_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      status: 'queued',
      accountBindingId: accountBinding.id,
      clientInstanceId: client.id,
      appServerSessionId: appServerSession.id,
      summary: 'Task run is queued without live dispatch.',
    });
    const diagnosis = CodexTaskDiagnosisSchema.parse({
      id: 'codex_task_diagnosis_1',
      schemaVersion,
      observedAt: createdAt,
      taskRunId: taskRun.id,
      diagnosisKind: 'healthy',
      status: 'healthy',
      confidence: 1,
      summary: 'Diagnosis stores a safe status.',
    });
    const recovery = CodexRecoveryRunSchema.parse({
      id: 'codex_recovery_run_1',
      schemaVersion,
      createdAt,
      taskRunId: taskRun.id,
      recoveryKind: 'none',
      status: 'planned',
      approvalRequired: false,
      summary: 'Recovery run is metadata-only and disabled.',
    });
    const accountPool = AccountPoolSchema.parse({
      id: 'account_pool_1',
      schemaVersion,
      observedAt: createdAt,
      poolHash: 'sha256:account-pool',
      status: 'ready',
      accountCount: 1,
      readyCount: 1,
      blockedCount: 0,
      summary: 'Account pool stores counts and hash refs.',
    });
    const clientPool = ClientPoolSchema.parse({
      id: 'client_pool_1',
      schemaVersion,
      observedAt: createdAt,
      poolHash: 'sha256:client-pool',
      status: 'ready',
      clientCount: 1,
      readyCount: 1,
      blockedCount: 0,
      summary: 'Client pool stores counts and hash refs.',
    });
    const lease = LeaseSchema.parse({
      id: 'pool_lease_1',
      schemaVersion,
      createdAt,
      targetKind: 'account',
      targetIdHash: accountBinding.codexAccountHash,
      holderHash: 'sha256:holder',
      status: 'active',
      summary: 'Lease stores no secret.',
    });
    const quota = QuotaSnapshotSchema.parse({
      id: 'quota_snapshot_1',
      schemaVersion,
      observedAt: createdAt,
      subjectKind: 'unified-account',
      subjectHash: accountBinding.codexAccountHash,
      status: 'available',
      limitCount: 10,
      usedCount: 1,
      remainingCount: 9,
      summary: 'Quota snapshot stores counts only.',
    });
    const evidenceBundle = EvidenceBundleSchema.parse({
      id: 'evidence_bundle_1',
      schemaVersion,
      createdAt,
      bundleHash: 'sha256:evidence-bundle',
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      evidenceCount: 1,
      auditEventCount: 1,
      summary: 'Evidence bundle stores refs and counts only.',
    });

    const saved = [
      await expectRoundTrip(first.businessWorkspaces, workspace),
      await expectRoundTrip(first.businessMembershipMirrors, membership),
      await expectRoundTrip(first.chromeProfileBindings, profileBinding),
      await expectRoundTrip(first.chatGptSessionHealth, sessionHealth),
      await expectRoundTrip(first.humanCheckpoints, checkpoint),
      await expectRoundTrip(first.codexClientInstances, client),
      await expectRoundTrip(first.codexAppServerSessions, appServerSession),
      await expectRoundTrip(first.codexAccountBindings, accountBinding),
      await expectRoundTrip(first.codexTaskIntents, intent),
      await expectRoundTrip(first.codexTaskRuns, taskRun),
      await expectRoundTrip(first.codexTaskDiagnoses, diagnosis),
      await expectRoundTrip(first.codexRecoveryRuns, recovery),
      await expectRoundTrip(first.accountPools, accountPool),
      await expectRoundTrip(first.clientPools, clientPool),
      await expectRoundTrip(first.poolLeases, lease),
      await expectRoundTrip(first.quotaSnapshots, quota),
      await expectRoundTrip(first.evidenceBundles, evidenceBundle),
    ];
    await expect(first.codexTaskRuns.listRecords({ status: 'queued' })).resolves.toEqual([
      taskRun,
    ]);
    await expect(first.codexTaskRuns.listRecords({ status: 'completed' })).resolves.toEqual([]);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.businessWorkspaces.getRecord(workspace.id)).resolves.toEqual(workspace);
    await expect(reopened.codexTaskRuns.getRecord(taskRun.id)).resolves.toEqual(taskRun);
    await expect(reopened.evidenceBundles.getRecord(evidenceBundle.id)).resolves.toEqual(
      evidenceBundle,
    );
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(profileBinding.rawPathStored).toBe(false);
    expect(sessionHealth.tokenStored).toBe(false);
    expect(sessionHealth.cookieStored).toBe(false);
    expect(sessionHealth.sessionStored).toBe(false);
    expect(checkpoint.sensitiveInputStored).toBe(false);
    expect(intent.rawPromptStored).toBe(false);
    expect(recovery.executionDisabled).toBe(true);
    expect(lease.leaseSecretStored).toBe(false);
  });

  it('round-trips M59 task closure projections without raw diff, path, or PR body', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m59-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const taskRun = CodexTaskRunSchema.parse({
      id: 'codex_task_run_m59_store_1',
      schemaVersion,
      createdAt,
      intentId: 'codex_task_intent_m59_store_1',
      status: 'completed',
      dispatchMode: 'live_app_server',
      preflightStatus: 'ready',
      approvalStatus: 'approved',
      dispatchAllowed: true,
      eventStreamStatus: 'completed',
      ciStatus: 'pending',
      diffSummaryId: 'codex_task_diff_summary_m59_store_1',
      verificationProjectionId: 'codex_task_verification_m59_store_1',
      reviewProjectionId: 'codex_task_review_m59_store_1',
      githubClosureProjectionId: 'codex_task_github_closure_m59_store_1',
      closureRunId: 'codex_task_closure_run_m59_store_1',
      closureSummaryHash: 'sha256:closure-summary',
      summary: 'Completed task run has metadata-only closure writeback ids.',
    });
    const diffSummary = CodexTaskDiffSummaryProjectionSchema.parse({
      id: taskRun.diffSummaryId,
      schemaVersion,
      observedAt: createdAt,
      taskRunId: taskRun.id,
      status: 'changed',
      fileCount: 1,
      pathHashCount: 1,
      pathHashes: ['sha256:path'],
      diffHash: 'sha256:diff',
      diffSummaryHash: 'sha256:diff-summary',
      summary: 'Diff summary stores only path and diff hashes.',
    });
    const verification = CodexTaskVerificationProjectionSchema.parse({
      id: taskRun.verificationProjectionId,
      schemaVersion,
      createdAt,
      taskRunId: taskRun.id,
      status: 'passed',
      targetCount: 3,
      passedCount: 3,
      failedCount: 0,
      skippedCount: 0,
      verificationRunIdHash: 'sha256:verification-run',
      commandSummaryHash: 'sha256:verification-command',
      outputSummaryHash: 'sha256:verification-output',
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      summary: 'Verification projection stores counts and hashes only.',
    });
    const review = CodexTaskReviewProjectionSchema.parse({
      id: taskRun.reviewProjectionId,
      schemaVersion,
      createdAt,
      taskRunId: taskRun.id,
      status: 'ready_for_review',
      reviewPackageIdHash: 'sha256:review-package',
      packageHash: 'sha256:package',
      findingCount: 0,
      blockerCount: 0,
      readyForReviewDraftOnly: true,
      summary: 'Review projection remains draft-only.',
    });
    const githubClosure = CodexTaskGithubClosureProjectionSchema.parse({
      id: taskRun.githubClosureProjectionId,
      schemaVersion,
      createdAt,
      taskRunId: taskRun.id,
      status: 'dry_run_planned',
      branchPublishPlanIdHash: 'sha256:branch-plan',
      draftPrPlanIdHash: 'sha256:draft-pr-plan',
      ciStatus: 'pending',
      branchPublishDryRunPlanned: true,
      draftPrDryRunPlanned: true,
      summary: 'GitHub closure stores dry-run plan hashes only.',
    });
    const closureRun = CodexTaskClosureRunSchema.parse({
      id: taskRun.closureRunId,
      schemaVersion,
      createdAt,
      taskRunId: taskRun.id,
      status: 'dry_run_planned',
      diffSummaryId: diffSummary.id,
      verificationProjectionId: verification.id,
      reviewProjectionId: review.id,
      githubClosureProjectionId: githubClosure.id,
      ciStatus: githubClosure.ciStatus,
      changedFileCount: diffSummary.fileCount,
      verificationTargetCount: verification.targetCount,
      reviewFindingCount: review.findingCount,
      blockerCount: 0,
      branchPublishDryRunIdHash: 'sha256:branch-dry-run',
      draftPrDryRunIdHash: 'sha256:draft-pr-dry-run',
      closureHash: 'sha256:closure',
      summary: 'Closure run links safe child projections.',
    });

    const saved = [
      await expectRoundTrip(first.codexTaskRuns, taskRun),
      await expectRoundTrip(first.codexTaskDiffSummaries, diffSummary),
      await expectRoundTrip(first.codexTaskVerificationProjections, verification),
      await expectRoundTrip(first.codexTaskReviewProjections, review),
      await expectRoundTrip(first.codexTaskGithubClosureProjections, githubClosure),
      await expectRoundTrip(first.codexTaskClosureRuns, closureRun),
    ];
    await expect(first.codexTaskClosureRuns.listRecords({ status: 'dry_run_planned' })).resolves.toEqual([
      closureRun,
    ]);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.codexTaskClosureRuns.getRecord(closureRun.id)).resolves.toEqual(
      closureRun,
    );
    await expect(reopened.codexTaskGithubClosureProjections.getRecord(githubClosure.id)).resolves.toEqual(
      githubClosure,
    );
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(diffSummary.rawDiffStored).toBe(false);
    expect(githubClosure.rawPullRequestBodyStored).toBe(false);
    expect(githubClosure.remoteWriteAllowed).toBe(false);
    expect(closureRun.liveRemoteWriteAllowed).toBe(false);
  });

  it('round-trips M60 production readiness records without raw canary, drift, audit, or readiness data', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m60-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const canaryTask = CodexProductionCanaryTaskSchema.parse({
      id: 'codex_production_canary_task_store_1',
      schemaVersion,
      createdAt,
      canaryKind: 'thread-turn',
      taskHash: 'sha256:canary-task',
      status: 'planned',
      targetHash: 'sha256:target',
      dryRunOnly: true,
      approvalRequired: false,
      liveSmoke: false,
      highRisk: false,
      summary: 'Thread turn canary task stores a hashed target only.',
    });
    const canaryRun = CodexProductionCanaryRunSchema.parse({
      id: 'codex_production_canary_run_store_1',
      schemaVersion,
      createdAt,
      canaryTaskId: canaryTask.id,
      canaryKind: canaryTask.canaryKind,
      status: 'passed',
      checkCount: 2,
      passedCount: 2,
      failedCount: 0,
      blockerCount: 0,
      liveSmoke: false,
      highRiskLiveTaskBlocked: false,
      summary: 'Canary run stores counts and status only.',
    });
    const driftGate = CodexProductionDriftGateSchema.parse({
      id: 'codex_production_drift_gate_store_1',
      schemaVersion,
      observedAt: createdAt,
      gateKind: 'app-server-protocol',
      baselineHash: 'sha256:baseline-schema',
      observedHash: 'sha256:observed-schema',
      status: 'compatible',
      driftCount: 0,
      blockerCount: 0,
      highRiskLiveTaskBlocked: false,
      summary: 'Protocol drift gate stores schema hashes only.',
    });
    const auditExport = CodexProductionAuditExportSummarySchema.parse({
      id: 'codex_production_audit_export_store_1',
      schemaVersion,
      createdAt,
      exportHash: 'sha256:audit-export',
      manifestHash: 'sha256:audit-manifest',
      recordCount: 5,
      evidenceRefCount: 2,
      auditEventCount: 3,
      metadataOnly: true,
      summary: 'Audit export summary stores manifest hash and counts.',
    });
    const readinessGate = CodexProductionReadinessGateSchema.parse({
      id: 'codex_production_readiness_gate_store_1',
      schemaVersion,
      createdAt,
      status: 'ready',
      canaryRunCount: 1,
      failedCanaryCount: 0,
      driftGateCount: 1,
      blockingDriftCount: 0,
      auditExportSummaryId: auditExport.id,
      highRiskLiveTaskBlocked: false,
      liveSmokeAllowed: true,
      approvalRequiredForLiveSmoke: true,
      summary: 'Production readiness links canary, drift, and audit metadata.',
    });

    const saved = [
      await expectRoundTrip(first.codexProductionCanaryTasks, canaryTask),
      await expectRoundTrip(first.codexProductionCanaryRuns, canaryRun),
      await expectRoundTrip(first.codexProductionDriftGates, driftGate),
      await expectRoundTrip(first.codexProductionAuditExportSummaries, auditExport),
      await expectRoundTrip(first.codexProductionReadinessGates, readinessGate),
    ];
    await expect(first.codexProductionCanaryRuns.listRecords({ status: 'passed' })).resolves.toEqual([
      canaryRun,
    ]);
    await expect(
      first.codexProductionDriftGates.listRecords({ status: 'compatible' }),
    ).resolves.toEqual([driftGate]);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.codexProductionReadinessGates.getRecord(readinessGate.id)).resolves.toEqual(
      readinessGate,
    );
    await expect(
      reopened.codexProductionAuditExportSummaries.getRecord(auditExport.id),
    ).resolves.toEqual(auditExport);
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(serialized).not.toContain('raw canary check');
    expect(serialized).not.toContain('app server json schema body');
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(canaryTask.rawCheckStored).toBe(false);
    expect(canaryRun.rawOutputStored).toBe(false);
    expect(driftGate.rawSchemaStored).toBe(false);
    expect(driftGate.rawTargetStored).toBe(false);
    expect(auditExport.rawBodyStored).toBe(false);
    expect(readinessGate.rawReadinessDataStored).toBe(false);
  });

  it('round-trips M61 business quota readiness debug records as metadata-only JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m61-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const sourceProbe = BusinessQuotaSourceProbeSchema.parse({
      id: 'business_quota_source_probe_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceKind: 'app-server-rate-limits',
      status: 'ready',
      priority: 1,
      stabilityScore: 90,
      fieldCount: 4,
      readableFieldCount: 3,
      sourceRefHash: 'sha256:source-ref',
      hashPolicy: 'hash-only source refs and count-only quota fields',
      candidateOnly: false,
      summary: 'App Server rate limits are the preferred metadata source.',
    });
    const permissionProbe = BusinessQuotaPermissionProbeSchema.parse({
      id: 'business_quota_permission_probe_store_1',
      schemaVersion,
      observedAt: createdAt,
      role: 'admin',
      status: 'ready',
      workspaceHash: 'sha256:workspace',
      accountHash: 'sha256:account',
      canReadOwnQuota: true,
      canReadWorkspaceQuota: true,
      canReadMemberQuota: true,
      canReadSeatState: true,
      roleDeclaredByHuman: true,
      summary: 'Role readiness stores hashes and booleans only.',
    });
    const localCapabilityProbe = LocalCapabilityProbeSchema.parse({
      id: 'local_capability_probe_store_1',
      schemaVersion,
      observedAt: createdAt,
      capabilityKind: 'codex-app-server',
      status: 'ready',
      fixtureOnly: false,
      liveReadAvailable: false,
      storeProjectionAvailable: true,
      supervisorProjectionAvailable: true,
      appServerMethodCount: 2,
      summary: 'Local App Server methods are present but live read is gated.',
    });
    const forbiddenPathProbe = ForbiddenPathProbeSchema.parse({
      id: 'forbidden_path_probe_store_1',
      schemaVersion,
      observedAt: createdAt,
      pathKind: 'browser_storage',
      status: 'blocked',
      enforcementHash: 'sha256:forbidden',
      summary: 'Forbidden browser storage collection is blocked.',
    });
    const evidenceMatrix = QuotaEvidenceMatrixSchema.parse({
      id: 'quota_evidence_matrix_store_1',
      schemaVersion,
      createdAt,
      matrixHash: 'sha256:m61-matrix',
      fieldCount: 2,
      allowedFieldCount: 1,
      forbiddenFieldCount: 1,
      fields: [
        {
          fieldKeyHash: 'sha256:quota-status',
          sourceKind: 'app-server-rate-limits',
          sensitivity: 'status-only',
          hashPolicy: 'status enum only',
          persistedAs: 'status',
          allowed: true,
          summary: 'Quota status can round-trip as metadata.',
        },
        {
          fieldKeyHash: 'sha256:identity-material',
          sourceKind: 'manual-export',
          sensitivity: 'forbidden',
          hashPolicy: 'not persisted',
          persistedAs: 'not_persisted',
          allowed: false,
          summary: 'Identity material is not persisted.',
        },
      ],
      summary: 'Evidence matrix stores only hashed field keys and sensitivity labels.',
    });
    const readinessReport = QuotaReadinessDebugReportSchema.parse({
      id: 'quota_readiness_debug_report_store_1',
      schemaVersion,
      createdAt,
      reportHash: 'sha256:m61-report',
      status: 'needs_adapter',
      recommendedSourceKind: 'app-server-rate-limits',
      sourceProbeIds: [sourceProbe.id],
      permissionProbeIds: [permissionProbe.id],
      localCapabilityProbeIds: [localCapabilityProbe.id],
      forbiddenPathProbeIds: [forbiddenPathProbe.id],
      matrixId: evidenceMatrix.id,
      sourceProbeCount: 1,
      permissionProbeCount: 1,
      localCapabilityProbeCount: 1,
      forbiddenPathProbeCount: 1,
      goNoGoReasonHash: 'sha256:needs-adapter',
      liveReadReady: false,
      adapterActivationRecommended: true,
      summary: 'Debug report recommends adapter activation after gates are ready.',
    });

    const saved = [
      await expectRoundTrip(first.businessQuotaSourceProbes, sourceProbe),
      await expectRoundTrip(first.businessQuotaPermissionProbes, permissionProbe),
      await expectRoundTrip(first.localCapabilityProbes, localCapabilityProbe),
      await expectRoundTrip(first.forbiddenPathProbes, forbiddenPathProbe),
      await expectRoundTrip(first.quotaEvidenceMatrices, evidenceMatrix),
      await expectRoundTrip(first.quotaReadinessDebugReports, readinessReport),
    ];
    await expect(
      first.quotaReadinessDebugReports.listRecords({ status: 'needs_adapter' }),
    ).resolves.toEqual([readinessReport]);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.quotaReadinessDebugReports.getRecord(readinessReport.id)).resolves.toEqual(
      readinessReport,
    );
    await expect(reopened.quotaEvidenceMatrices.getRecord(evidenceMatrix.id)).resolves.toEqual(
      evidenceMatrix,
    );
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(serialized).not.toContain('raw identity');
    expect(serialized).not.toContain('profile path');
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(sourceProbe.rawSourceStored).toBe(false);
    expect(permissionProbe.rawIdentityStored).toBe(false);
    expect(localCapabilityProbe.directAdapterExecutionAllowed).toBe(false);
    expect(forbiddenPathProbe.rawMaterialStored).toBe(false);
    expect(readinessReport.rawReportStored).toBe(false);
  });

  it('round-trips M62 quota and UI automation records as metadata-only JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m62-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const sourceHealth = CodexQuotaSourceHealthSchema.parse({
      id: 'codex_quota_source_health_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceKind: 'browser-cdp-dom',
      status: 'healthy',
      sourceRefHash: 'sha256:source',
      priority: 1,
      stabilityScore: 80,
      observationCount: 1,
      liveReadReady: true,
      canaryPassed: true,
      summary: 'Quota source health stores status and hashes only.',
    });
    const seat = BusinessCodexSeatSchema.parse({
      id: 'business_codex_seat_store_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceIdHash: 'sha256:workspace',
      seatHash: 'sha256:seat',
      memberHash: 'sha256:member',
      codexAccountHash: 'sha256:account',
      status: 'active',
      codexEnabled: true,
      sourceHealthId: sourceHealth.id,
      summary: 'Seat stores no raw identity.',
    });
    const credit = WorkspaceCreditSnapshotSchema.parse({
      id: 'workspace_credit_snapshot_store_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceIdHash: seat.workspaceIdHash,
      status: 'available',
      limitCount: 20,
      usedCount: 5,
      remainingCount: 15,
      sourceHealthId: sourceHealth.id,
      summary: 'Workspace credit stores counts only.',
    });
    const usageLimit = CodexSeatUsageLimitSchema.parse({
      id: 'codex_seat_usage_limit_store_1',
      schemaVersion,
      observedAt: createdAt,
      subjectKind: 'business-codex-seat',
      subjectHash: seat.seatHash,
      limitKind: 'rate-limit',
      status: 'limited',
      remainingCount: 15,
      sourceHealthId: sourceHealth.id,
      summary: 'Usage limit stores status only.',
    });
    const attribution = QuotaAttributionSchema.parse({
      id: 'quota_attribution_store_1',
      schemaVersion,
      observedAt: createdAt,
      attributionHash: 'sha256:attribution',
      sourceHealthId: sourceHealth.id,
      workspaceIdHash: seat.workspaceIdHash,
      businessCodexSeatId: seat.id,
      workspaceCreditSnapshotId: credit.id,
      seatUsageLimitId: usageLimit.id,
      confidence: 'high',
      status: 'attributed',
      summary: 'Attribution links safe metadata records.',
    });
    const redaction = SensitiveRedactionReportSchema.parse({
      id: 'sensitive_redaction_report_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceHash: 'sha256:source',
      status: 'passed',
      scannedFieldCount: 2,
      redactedFieldCount: 1,
      summary: 'Redaction report stores counts only.',
    });
    const observation = UiObservationSourceSchema.parse({
      id: 'ui_observation_source_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceKind: 'business-page-dom',
      targetHash: 'sha256:target',
      selectorManifestHash: 'sha256:selectors',
      status: 'observed',
      fieldCount: 2,
      readableFieldCount: 2,
      redactionReportId: redaction.id,
      sourceHealthId: sourceHealth.id,
      summary: 'UI observation stores no DOM text.',
    });
    const cdpDom = CdpDomObservationSummarySchema.parse({
      id: 'cdp_dom_observation_summary_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceId: observation.id,
      targetHash: observation.targetHash,
      selectorManifestHash: observation.selectorManifestHash,
      nodeCount: 10,
      textFieldCount: 2,
      hashedTextCount: 2,
      cdpCommandCount: 2,
      cdpCommandHashes: ['sha256:command-a', 'sha256:command-b'],
      summary: 'CDP DOM summary stores hashes and counts.',
    });
    const electronRenderer = ElectronRendererObservationSummarySchema.parse({
      id: 'electron_renderer_observation_summary_store_1',
      schemaVersion,
      observedAt: createdAt,
      sourceId: observation.id,
      endpointHash: 'sha256:endpoint',
      targetIdHash: 'sha256:target-id',
      rendererTarget: true,
      domObservationSummaryId: cdpDom.id,
      uiResponsive: true,
      summary: 'Electron renderer observation stores metadata only.',
    });
    const crossCheck = BusinessQuotaCrossCheckReportSchema.parse({
      id: 'business_quota_cross_check_report_store_1',
      schemaVersion,
      observedAt: createdAt,
      appServerQuotaSnapshotId: 'quota_snapshot_store_1',
      appServerSourceHealthId: sourceHealth.id,
      uiObservationSourceId: observation.id,
      cdpDomObservationSummaryId: cdpDom.id,
      electronRendererObservationSummaryId: electronRenderer.id,
      redactionReportId: redaction.id,
      attributionId: attribution.id,
      status: 'partial',
      confidence: 'low',
      comparedFieldCount: 5,
      matchedFieldCount: 4,
      mismatchFieldCount: 0,
      unknownFieldCount: 1,
      sensitiveFindingCount: 1,
      fieldComparisonHashes: ['sha256:status', 'sha256:limit', 'sha256:usage'],
      summary: 'Cross-check report stores comparison hashes and counts only.',
    });
    const automationPolicy = AutomationCapabilityPolicySchema.parse({
      id: 'automation_capability_policy_store_1',
      schemaVersion,
      createdAt,
      capabilitySurface: 'codex-desktop-ui',
      actionClass: 'approved_guided_action',
      riskLevel: 'high',
      actionMode: 'write',
      approvalRequired: true,
      allowedActionCount: 1,
      summary: 'Guided UI actions require approval.',
    });
    const intent = UiAutomationIntentSchema.parse({
      id: 'ui_automation_intent_store_1',
      schemaVersion,
      createdAt,
      intentHash: 'sha256:intent',
      actionKind: 'click-allowlisted-control',
      actionClass: 'approved_guided_action',
      targetHash: 'sha256:target',
      riskLevel: 'high',
      approvalRequired: true,
      summary: 'UI action intent stores a target hash.',
    });
    const dryRun = UiAutomationDryRunPlanSchema.parse({
      id: 'ui_automation_dry_run_store_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      planHash: 'sha256:dry-run-plan',
      actionCount: 1,
      actionClass: intent.actionClass,
      riskLevel: intent.riskLevel,
      approvalRequired: true,
      authorityRequired: true,
      summary: 'UI dry-run stores a plan hash.',
    });
    const authority = UiAutomationAuthoritySchema.parse({
      id: 'ui_automation_authority_store_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: dryRun.id,
      authorityHash: 'sha256:authority',
      approvalArtifactIdHash: 'sha256:approval',
      allowed: true,
      actionClass: intent.actionClass,
      riskLevel: intent.riskLevel,
      summary: 'UI authority stores approval hash only.',
    });
    const run = UiAutomationRunSchema.parse({
      id: 'ui_automation_run_store_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      dryRunPlanId: dryRun.id,
      authorityId: authority.id,
      status: 'authorized',
      actionClass: intent.actionClass,
      actionCount: 1,
      approvedActionCount: 1,
      liveActionRequested: true,
      liveActionAllowed: true,
      summary: 'UI run stores status and counts only.',
    });
    const uiTargetFingerprint = UiTargetFingerprintSchema.parse({
      id: 'ui_target_fingerprint_store_1',
      schemaVersion,
      observedAt: createdAt,
      targetHash: 'sha256:admin-target',
      selectorHash: 'sha256:admin-selector',
      axRoleHash: 'sha256:button',
      fingerprintHash: 'sha256:admin-fingerprint',
      summary: 'UI target fingerprint persists hashes only.',
    });
    const adminIntent = AdminWriteIntentSchema.parse({
      id: 'admin_write_intent_store_1',
      schemaVersion,
      createdAt,
      intentHash: 'sha256:admin-intent',
      actionKind: 'assign-seat',
      actionClass: 'approved_admin_write',
      targetHash: 'sha256:admin-target',
      uiTargetFingerprintId: uiTargetFingerprint.id,
      selectorFingerprintHash: uiTargetFingerprint.selectorHash,
      riskLevel: 'critical',
      summary: 'Admin write intent stores target hashes only.',
    });
    const adminDryRun = AdminWriteDryRunPlanSchema.parse({
      id: 'admin_write_dry_run_store_1',
      schemaVersion,
      createdAt,
      intentId: adminIntent.id,
      planHash: 'sha256:admin-plan',
      actionCount: 1,
      actionClass: adminIntent.actionClass,
      riskLevel: adminIntent.riskLevel,
      targetFingerprintHash: uiTargetFingerprint.fingerprintHash,
      summary: 'Admin write dry-run stores a plan hash only.',
    });
    const adminAuthority = AdminWriteAuthoritySchema.parse({
      id: 'admin_write_authority_store_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: adminDryRun.id,
      authorityHash: 'sha256:admin-authority',
      approvalArtifactIdHash: 'sha256:admin-approval',
      allowed: true,
      actionClass: adminIntent.actionClass,
      riskLevel: adminIntent.riskLevel,
      summary: 'Admin write authority stores approval hash only.',
    });
    const adminRun = AdminWriteRunSchema.parse({
      id: 'admin_write_run_store_1',
      schemaVersion,
      createdAt,
      intentId: adminIntent.id,
      dryRunPlanId: adminDryRun.id,
      authorityId: adminAuthority.id,
      status: 'authorized',
      actionClass: adminIntent.actionClass,
      actionCount: 1,
      approvedActionCount: 1,
      liveActionRequested: true,
      liveActionAllowed: true,
      targetFingerprintHash: uiTargetFingerprint.fingerprintHash,
      summary: 'Admin write run stores metadata-only status.',
    });
    const ownerAdminSurface = OwnerAdminReadSurfaceSummarySchema.parse({
      id: 'owner_admin_read_surface_store_1',
      schemaVersion,
      observedAt: createdAt,
      surfaceKind: 'admin-members',
      targetHash: 'sha256:owner-admin-target',
      pageHash: 'sha256:page',
      axTreeHash: 'sha256:ax',
      domSnapshotHash: 'sha256:dom',
      layoutHash: 'sha256:layout',
      screenshotHash: 'sha256:screenshot',
      networkEndpointHashes: ['sha256:endpoint'],
      fieldCount: 3,
      credentialFieldCount: 0,
      summary: 'Owner admin read surface stores hashes only.',
    });
    const rosterSnapshot = BusinessAdminMemberRosterSnapshotSchema.parse({
      id: 'business_admin_member_roster_snapshot_store_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceHash: 'sha256:workspace',
      rosterHash: 'sha256:roster',
      memberCount: 3,
      ownerCount: 1,
      adminCount: 1,
      memberRoleCount: 1,
      pendingInviteCount: 1,
      seatAssignedCount: 2,
      memberEmailHashCount: 3,
      roleHashCount: 3,
      summary: 'Owner roster snapshot stores aggregate counts only.',
    });
    const billingSummary = BusinessBillingSummarySchema.parse({
      id: 'business_billing_summary_store_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceHash: 'sha256:workspace',
      billingHash: 'sha256:billing',
      codexSeatCount: 2,
      creditBalanceKnown: true,
      creditBalanceHash: 'sha256:credits',
      invoiceSummaryHashCount: 1,
      pendingInviteCount: 1,
      limitIncidentCount: 1,
      usageAlertCount: 1,
      summary: 'Billing summary stores hashes and counts only.',
    });
    const ownerAdminReport = OwnerAdminExtractionReportSchema.parse({
      id: 'owner_admin_extraction_report_store_1',
      schemaVersion,
      observedAt: createdAt,
      status: 'observed',
      workspaceHash: 'sha256:workspace',
      surfaceCount: 1,
      memberCount: 3,
      pendingInviteCount: 1,
      seatCount: 2,
      invoiceCount: 1,
      limitIncidentCount: 1,
      usageAlertCount: 1,
      sourceSurfaceIds: [ownerAdminSurface.id],
      rosterSnapshotId: rosterSnapshot.id,
      billingSummaryId: billingSummary.id,
      summary: 'Owner admin extraction report stores metadata only.',
    });
    const profileObservation = BusinessProfileWorkspaceObservationSchema.parse({
      id: 'business_profile_workspace_observation_store_1',
      schemaVersion,
      observedAt: createdAt,
      ownerRosterSnapshotId: rosterSnapshot.id,
      profileHash: 'sha256:profile',
      accountHash: 'sha256:account',
      expectedWorkspaceHash: rosterSnapshot.workspaceHash,
      observedWorkspaceHash: rosterSnapshot.workspaceHash,
      status: 'business_workspace',
      memberInOwnerRoster: true,
      dispatchAllowed: true,
      codexDispatchBlocked: false,
      summary: 'Profile workspace observation stores hashes only.',
    });
    const workspaceSwitchDryRun = BusinessWorkspaceSwitchDryRunPlanSchema.parse({
      id: 'business_workspace_switch_dry_run_store_1',
      schemaVersion,
      createdAt,
      profileWorkspaceObservationId: profileObservation.id,
      ownerRosterSnapshotId: rosterSnapshot.id,
      profileHash: profileObservation.profileHash,
      expectedWorkspaceHash: rosterSnapshot.workspaceHash,
      selectorFingerprintHash: 'sha256:workspace-switch-selector',
      summary: 'Workspace switch dry-run stores selector fingerprint only.',
    });
    const workspaceSwitchRun = BusinessWorkspaceSwitchRunSchema.parse({
      id: 'business_workspace_switch_run_store_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: workspaceSwitchDryRun.id,
      profileWorkspaceObservationId: profileObservation.id,
      status: 'blocked',
      summary: 'Workspace switch execution remains blocked.',
    });
    const reconciliationReport = BusinessMemberReconciliationReportSchema.parse({
      id: 'business_member_reconciliation_report_store_1',
      schemaVersion,
      observedAt: createdAt,
      status: 'ready',
      ownerRosterSnapshotId: rosterSnapshot.id,
      workspaceHash: rosterSnapshot.workspaceHash,
      rosterHash: rosterSnapshot.rosterHash,
      profileObservationIds: [profileObservation.id],
      observedProfileCount: 1,
      readyProfileCount: 1,
      dispatchAllowed: true,
      summary: 'Business member reconciliation stores readiness metadata only.',
    });
    const workspaceQuotaReadiness = WorkspaceCodexQuotaReadinessSchema.parse({
      id: 'workspace_codex_quota_readiness_store_1',
      schemaVersion,
      observedAt: createdAt,
      workspaceHash: rosterSnapshot.workspaceHash,
      status: 'ready',
      ownerRosterSnapshotId: rosterSnapshot.id,
      billingSummaryId: billingSummary.id,
      quotaSnapshotIds: ['quota_snapshot_store_1'],
      sourceHealthId: sourceHealth.id,
      codexSeatCount: billingSummary.codexSeatCount,
      remainingCountKnown: true,
      remainingCountHash: 'sha256:workspace-remaining',
      canaryPassed: true,
      dispatchAllowed: true,
      summary: 'Workspace Codex quota readiness stores hash-bound readiness only.',
    });
    const accountQuotaReadiness = AccountCodexQuotaReadinessSchema.parse({
      id: 'account_codex_quota_readiness_store_1',
      schemaVersion,
      observedAt: createdAt,
      accountHash: profileObservation.accountHash ?? 'sha256:account',
      workspaceHash: rosterSnapshot.workspaceHash,
      status: 'ready',
      quotaSnapshotId: 'quota_snapshot_store_1',
      profileWorkspaceObservationId: profileObservation.id,
      sourceHealthId: sourceHealth.id,
      memberInOwnerRoster: true,
      workspaceMatches: true,
      codexSeatAvailable: true,
      quotaStatus: 'available',
      remainingCountKnown: true,
      remainingCountHash: 'sha256:account-remaining',
      dispatchAllowed: true,
      summary: 'Account Codex quota readiness stores hash-bound readiness only.',
    });
    const quotaFusionReport = CodexQuotaFusionReportSchema.parse({
      id: 'codex_quota_fusion_report_store_1',
      schemaVersion,
      observedAt: createdAt,
      status: 'ready',
      workspaceReadinessId: workspaceQuotaReadiness.id,
      accountReadinessIds: [accountQuotaReadiness.id],
      workspaceHash: rosterSnapshot.workspaceHash,
      accountCount: 1,
      readyAccountCount: 1,
      dispatchAllowed: true,
      canaryPassed: true,
      summary: 'Codex quota fusion report stores readiness IDs and counts only.',
    });

    const saved = [
      await expectRoundTrip(first.codexQuotaSourceHealth, sourceHealth),
      await expectRoundTrip(first.businessCodexSeats, seat),
      await expectRoundTrip(first.workspaceCreditSnapshots, credit),
      await expectRoundTrip(first.codexSeatUsageLimits, usageLimit),
      await expectRoundTrip(first.quotaAttributions, attribution),
      await expectRoundTrip(first.sensitiveRedactionReports, redaction),
      await expectRoundTrip(first.uiObservationSources, observation),
      await expectRoundTrip(first.cdpDomObservationSummaries, cdpDom),
      await expectRoundTrip(first.electronRendererObservationSummaries, electronRenderer),
      await expectRoundTrip(first.businessQuotaCrossCheckReports, crossCheck),
      await expectRoundTrip(first.automationCapabilityPolicies, automationPolicy),
      await expectRoundTrip(first.uiAutomationIntents, intent),
      await expectRoundTrip(first.uiAutomationDryRunPlans, dryRun),
      await expectRoundTrip(first.uiAutomationAuthorities, authority),
      await expectRoundTrip(first.uiAutomationRuns, run),
      await expectRoundTrip(first.uiTargetFingerprints, uiTargetFingerprint),
      await expectRoundTrip(first.adminWriteIntents, adminIntent),
      await expectRoundTrip(first.adminWriteDryRunPlans, adminDryRun),
      await expectRoundTrip(first.adminWriteAuthorities, adminAuthority),
      await expectRoundTrip(first.adminWriteRuns, adminRun),
      await expectRoundTrip(first.ownerAdminReadSurfaceSummaries, ownerAdminSurface),
      await expectRoundTrip(first.businessAdminMemberRosterSnapshots, rosterSnapshot),
      await expectRoundTrip(first.businessBillingSummaries, billingSummary),
      await expectRoundTrip(first.ownerAdminExtractionReports, ownerAdminReport),
      await expectRoundTrip(first.businessProfileWorkspaceObservations, profileObservation),
      await expectRoundTrip(first.businessWorkspaceSwitchDryRunPlans, workspaceSwitchDryRun),
      await expectRoundTrip(first.businessWorkspaceSwitchRuns, workspaceSwitchRun),
      await expectRoundTrip(first.businessMemberReconciliationReports, reconciliationReport),
      await expectRoundTrip(first.workspaceCodexQuotaReadiness, workspaceQuotaReadiness),
      await expectRoundTrip(first.accountCodexQuotaReadiness, accountQuotaReadiness),
      await expectRoundTrip(first.codexQuotaFusionReports, quotaFusionReport),
    ];
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.codexQuotaSourceHealth.getRecord(sourceHealth.id)).resolves.toEqual(
      sourceHealth,
    );
    await expect(reopened.uiAutomationRuns.getRecord(run.id)).resolves.toEqual(run);
    await expect(reopened.adminWriteRuns.getRecord(adminRun.id)).resolves.toEqual(adminRun);
    await expect(reopened.ownerAdminExtractionReports.getRecord(ownerAdminReport.id)).resolves.toEqual(
      ownerAdminReport,
    );
    await expect(
      reopened.businessMemberReconciliationReports.getRecord(reconciliationReport.id),
    ).resolves.toEqual(reconciliationReport);
    await expect(
      reopened.codexQuotaFusionReports.getRecord(quotaFusionReport.id),
    ).resolves.toEqual(quotaFusionReport);
    await expect(reopened.businessQuotaCrossCheckReports.getRecord(crossCheck.id)).resolves.toEqual(
      crossCheck,
    );
    await reopened.close();

    const serialized = JSON.stringify(saved);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(serialized).not.toContain('raw DOM');
    expect(serialized).not.toContain('session storage');
    expect(findAdversarialPublicOutputRoundTripLeaks(saved)).toEqual([]);
    expect(sourceHealth.rawSourceStored).toBe(false);
    expect(seat.rawSeatBodyStored).toBe(false);
    expect(credit.rawCreditBodyStored).toBe(false);
    expect(usageLimit.rawLimitBodyStored).toBe(false);
    expect(attribution.rawAttributionStored).toBe(false);
    expect(redaction.rawPayloadStored).toBe(false);
    expect(observation.rawDomStored).toBe(false);
    expect(cdpDom.networkBodyStored).toBe(false);
    expect(electronRenderer.mainInspectorUsed).toBe(false);
    expect(crossCheck.rawSensitiveStored).toBe(false);
    expect(authority.requestBodyAuthorityAccepted).toBe(false);
    expect(adminAuthority.requestBodyAuthorityAccepted).toBe(false);
    expect(adminRun.executionDisabled).toBe(true);
    expect(ownerAdminSurface.rawDomStored).toBe(false);
    expect(rosterSnapshot.cleartextEmailStored).toBe(false);
    expect(ownerAdminReport.cleartextBusinessDataStored).toBe(false);
    expect(profileObservation.cookieSessionTokenRead).toBe(false);
    expect(workspaceSwitchDryRun.liveClickAllowed).toBe(false);
    expect(workspaceSwitchRun.executionDisabled).toBe(true);
    expect(reconciliationReport.liveClickPerformed).toBe(false);
    expect(workspaceQuotaReadiness.rawQuotaPayloadStored).toBe(false);
    expect(accountQuotaReadiness.rawAccountStored).toBe(false);
    expect(quotaFusionReport.rawBillingBodyStored).toBe(false);
  });

  it('round-trips M70 privileged Business records in isolated cleartext tables', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m70-privileged-business-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');
    const first = await createSqliteStore({ dbPath });
    const record = PrivilegedBusinessDataRecordSchema.parse({
      id: 'privileged_business_record_1',
      schemaVersion,
      observedAt: createdAt,
      recordKind: 'member-profile',
      workspaceHash: 'sha256:workspace',
      subjectHash: 'sha256:member',
      businessFields: {
        memberEmail: 'member@example.com',
        memberRole: 'admin',
        codexSeat: 'assigned',
      },
      fieldCount: 3,
      businessFieldHash: 'sha256:business-fields',
      cleartextBusinessDataStored: true,
      credentialMaterialStored: false,
      tokenCookieSessionStored: false,
      browserStorageStored: false,
      rawNetworkBodyStored: false,
      accessPolicyHash: 'sha256:access-policy',
      evidenceRefIds: ['evidence:m70'],
      auditEventIds: ['audit:m70'],
      summary: 'Privileged Business cleartext record is isolated from public projections.',
    });
    const accessLog = PrivilegedBusinessAccessLogSchema.parse({
      id: 'privileged_business_access_log_1',
      schemaVersion,
      createdAt,
      accessKind: 'record-create',
      recordIds: [record.id],
      recordCount: 1,
      operatorHash: 'sha256:operator',
      approvalArtifactIdHash: 'sha256:approval',
      highPrivilegeApprovalRequired: true,
      approvalProvided: true,
      cleartextReturned: false,
      credentialMaterialReturned: false,
      accessApproved: true,
      evidenceRefIds: ['evidence:m70'],
      auditEventIds: ['audit:m70'],
      summary: 'Access log stores approval and record ids, not cleartext fields.',
    });
    const manifest = PrivilegedBusinessExportManifestSchema.parse({
      id: 'privileged_business_export_manifest_1',
      schemaVersion,
      createdAt,
      exportHash: 'sha256:export',
      recordIds: [record.id],
      recordCount: 1,
      fieldHashCount: 3,
      operatorHash: 'sha256:operator',
      approvalArtifactIdHash: 'sha256:approval',
      accessLogId: accessLog.id,
      highPrivilegeApprovalRequired: true,
      cleartextBusinessDataExportPrepared: true,
      credentialMaterialExported: false,
      tokenCookieSessionExported: false,
      rawNetworkBodyExported: false,
      evidenceRefIds: ['evidence:m70'],
      auditEventIds: ['audit:m70'],
      summary: 'Export manifest stores ids and hashes for an approved local export.',
    });

    await expectRoundTrip(first.privilegedBusinessDataRecords, record);
    await expectRoundTrip(first.privilegedBusinessAccessLogs, accessLog);
    await expectRoundTrip(first.privilegedBusinessExportManifests, manifest);
    await first.close();

    const reopened = await createSqliteStore({ dbPath });
    await expect(reopened.privilegedBusinessDataRecords.getRecord(record.id)).resolves.toEqual(
      record,
    );
    const reopenedAccessLog = await reopened.privilegedBusinessAccessLogs.getRecord(accessLog.id);
    const reopenedManifest = await reopened.privilegedBusinessExportManifests.getRecord(manifest.id);
    await reopened.close();

    expect(record.businessFields.memberEmail).toBe('member@example.com');
    expect(JSON.stringify([reopenedAccessLog, reopenedManifest])).not.toContain(
      'member@example.com',
    );
    expect(manifest.credentialMaterialExported).toBe(false);
    expect(() =>
      PrivilegedBusinessDataRecordSchema.parse({
        ...record,
        id: 'privileged_business_record_credential_1',
        businessFields: {
          sessionToken: 'should-never-persist',
        },
        fieldCount: 1,
      }),
    ).toThrow();
  });

  it('rejects forbidden M51 raw fields before metadata records are persisted', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m51-store-negative-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });

    expect(() =>
      CodexTaskIntentSchema.parse({
        id: 'codex_task_intent_raw_1',
        schemaVersion,
        createdAt,
        intentHash: 'sha256:intent',
        status: 'planned',
        summary: 'Unsafe raw task intent.',
        metadata: {
          rawPrompt: adversarialPublicOutputFixture,
        },
      }),
    ).toThrow();
    expect(() =>
      ChromeProfileBindingSchema.parse({
        id: 'chrome_profile_binding_raw_1',
        schemaVersion,
        createdAt,
        profileId: 'default',
        profilePathHash: 'sha256:profile-path',
        rawPath: adversarialPublicOutputFixture,
        summary: 'Unsafe raw profile binding.',
      }),
    ).toThrow();
    expect(() =>
      ChatGptSessionHealthSchema.parse({
        id: 'chatgpt_session_raw_1',
        schemaVersion,
        observedAt: createdAt,
        profileBindingId: 'chrome_profile_binding_1',
        status: 'blocked',
        summary: 'Unsafe raw session health.',
        metadata: {
          token: adversarialPublicOutputFixture,
          cookie: adversarialPublicOutputFixture,
          session: adversarialPublicOutputFixture,
          storage: adversarialPublicOutputFixture,
        },
      }),
    ).toThrow();

    await expect(store.codexTaskIntents.listRecords()).resolves.toEqual([]);
    await expect(store.chromeProfileBindings.listRecords()).resolves.toEqual([]);
    await expect(store.chatGptSessionHealth.listRecords()).resolves.toEqual([]);
    await store.close();
  });
});

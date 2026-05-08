import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AccountPoolSchema,
  BusinessMembershipMirrorSchema,
  BusinessWorkspaceSchema,
  ChatGptSessionHealthSchema,
  ChromeProfileBindingSchema,
  ClientPoolSchema,
  CodexAccountBindingSchema,
  CodexAppServerSessionSchema,
  CodexClientInstanceSchema,
  CodexProductionAuditExportSummarySchema,
  CodexProductionCanaryRunSchema,
  CodexProductionCanaryTaskSchema,
  CodexProductionDriftGateSchema,
  CodexProductionReadinessGateSchema,
  CodexRecoveryRunSchema,
  CodexTaskClosureRunSchema,
  CodexTaskDiagnosisSchema,
  CodexTaskDiffSummaryProjectionSchema,
  CodexTaskGithubClosureProjectionSchema,
  CodexTaskIntentSchema,
  CodexTaskReviewProjectionSchema,
  CodexTaskRunSchema,
  CodexTaskVerificationProjectionSchema,
  EvidenceBundleSchema,
  HumanCheckpointSchema,
  LeaseSchema,
  QuotaSnapshotSchema,
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

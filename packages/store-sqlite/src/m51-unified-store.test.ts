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
  CodexRecoveryRunSchema,
  CodexTaskDiagnosisSchema,
  CodexTaskIntentSchema,
  CodexTaskRunSchema,
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

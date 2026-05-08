import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createClaudeCodeRepairRun,
  createCodexAccountRecord,
  createCodexDesktopObservedState,
  createTaskDispatchEvidence,
  createWorkspaceMemberActionEvidence,
  routeCodexTaskByCapacity,
} from '@codexhub/codex-desktop-orchestration-kernel';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

describe('Codex Desktop orchestration SQLite stores', () => {
  it('round-trips M75 metadata-only records', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m75-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const now = () => '2026-05-09T00:00:00.000Z';
    const account = createCodexAccountRecord({
      accountSeed: adversarialPublicOutputFixture,
      workspaceSeed: adversarialPublicOutputFixture,
      authorizedForCodexDesktop: true,
      switchAllowed: true,
      taskDispatchAllowed: true,
      loginState: 'logged_in',
      capacityStatus: 'ready',
      now,
    });
    const state = createCodexDesktopObservedState({
      clientSeed: adversarialPublicOutputFixture,
      currentAccountSeed: adversarialPublicOutputFixture,
      currentWorkspaceSeed: adversarialPublicOutputFixture,
      loginState: 'logged_in',
      capacityStatus: 'ready',
      taskState: 'composer_ready',
      canSwitchAccount: true,
      canSubmitTask: true,
      now,
    });
    const routing = routeCodexTaskByCapacity({
      inputRefSeed: adversarialPublicOutputFixture,
      inputSeed: adversarialPublicOutputFixture,
      currentAccountHash: account.accountHash,
      authorizedAccounts: [account],
      policyAllowsSwitch: true,
      now,
    });
    const dispatch = createTaskDispatchEvidence({
      dryRunId: 'm75_dry_run_1',
      routingDecision: routing,
      inputRefSeed: adversarialPublicOutputFixture,
      inputSeed: adversarialPublicOutputFixture,
      canSubmitTaskVerified: true,
      now,
    });
    const memberAction = createWorkspaceMemberActionEvidence({
      actionKind: 'member_remove',
      workspaceSeed: adversarialPublicOutputFixture,
      memberSeed: adversarialPublicOutputFixture,
      antiEvasionPassed: false,
      now,
    });
    const repair = createClaudeCodeRepairRun({
      failureEvidenceSeed: adversarialPublicOutputFixture,
      controlledWorktreeSeed: adversarialPublicOutputFixture,
      proposalSeed: adversarialPublicOutputFixture,
      now,
    });

    await store.codexAccountRecords.saveRecord(account);
    await store.codexDesktopObservedStates.saveRecord(state);
    await store.codexTaskRoutingDecisions.saveRecord(routing);
    await store.taskDispatchEvidenceRecords.saveRecord(dispatch);
    await store.workspaceMemberActionEvidenceRecords.saveRecord(memberAction);
    await store.claudeCodeRepairRuns.saveRecord(repair);

    const records = [
      ...(await store.codexAccountRecords.listRecords({ limit: 10 })),
      ...(await store.codexDesktopObservedStates.listRecords({ limit: 10 })),
      ...(await store.codexTaskRoutingDecisions.listRecords({ limit: 10 })),
      ...(await store.taskDispatchEvidenceRecords.listRecords({ limit: 10 })),
      ...(await store.workspaceMemberActionEvidenceRecords.listRecords({ limit: 10 })),
      ...(await store.claudeCodeRepairRuns.listRecords({ limit: 10 })),
    ];

    expect(records).toHaveLength(6);
    expect(JSON.stringify(records)).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);
  });
});

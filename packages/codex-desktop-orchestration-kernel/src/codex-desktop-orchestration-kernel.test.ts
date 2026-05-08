import { describe, expect, it } from 'vitest';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  containsForbiddenM75RequestBody,
  createClaudeCodeRepairRun,
  createCodexAccountRecord,
  createCodexDesktopObservedState,
  createTaskDispatchEvidence,
  createWorkspaceMemberActionEvidence,
  routeCodexTaskByCapacity,
} from './index';

describe('codex-desktop-orchestration-kernel', () => {
  const now = () => '2026-05-09T00:00:00.000Z';

  it('routes to the current authorized account when capacity is legitimate', () => {
    const account = createCodexAccountRecord({
      accountSeed: adversarialPublicOutputFixture,
      workspaceSeed: 'workspace-a',
      authorizedForCodexDesktop: true,
      switchAllowed: true,
      taskDispatchAllowed: true,
      loginState: 'logged_in',
      capacityStatus: 'ready',
      now,
    });
    const state = createCodexDesktopObservedState({
      clientSeed: 'desktop-a',
      currentAccountSeed: adversarialPublicOutputFixture,
      currentWorkspaceSeed: 'workspace-a',
      loginState: 'logged_in',
      capacityStatus: 'ready',
      taskState: 'composer_ready',
      canSwitchAccount: true,
      canSubmitTask: true,
      now,
    });
    const decision = routeCodexTaskByCapacity({
      inputRefSeed: adversarialPublicOutputFixture,
      inputSeed: adversarialPublicOutputFixture,
      currentAccountHash: account.accountHash,
      authorizedAccounts: [account],
      policyAllowsSwitch: true,
      now,
    });
    const dispatch = createTaskDispatchEvidence({
      dryRunId: 'dry_run_1',
      routingDecision: decision,
      inputRefSeed: adversarialPublicOutputFixture,
      inputSeed: adversarialPublicOutputFixture,
      promptSummarySeed: adversarialPublicOutputFixture,
      canSubmitTaskVerified: true,
      now,
    });
    const serialized = JSON.stringify([account, state, decision, dispatch]);

    expect(decision.routingStrategy).toBe('use_current_account');
    expect(decision.status).toBe('ready');
    expect(dispatch.rawPromptStored).toBe(false);
    expect(dispatch.credentialMaterialStored).toBe(false);
    expect(serialized).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks([account, state, decision, dispatch])).toEqual(
      [],
    );
  });

  it('switches only to registered authorized accounts and blocks quota-evasion routing', () => {
    const exhaustedCurrent = createCodexAccountRecord({
      accountSeed: 'current',
      workspaceSeed: 'workspace-a',
      authorizedForCodexDesktop: true,
      taskDispatchAllowed: false,
      loginState: 'logged_in',
      capacityStatus: 'quota_exhausted',
      now,
    });
    const availableTarget = createCodexAccountRecord({
      accountSeed: 'target',
      workspaceSeed: 'workspace-a',
      authorizedForCodexDesktop: true,
      switchAllowed: true,
      taskDispatchAllowed: true,
      loginState: 'logged_in',
      capacityStatus: 'ready',
      now,
    });
    const switchDecision = routeCodexTaskByCapacity({
      inputRefSeed: 'input-ref',
      currentAccountHash: exhaustedCurrent.accountHash,
      authorizedAccounts: [exhaustedCurrent, availableTarget],
      policyAllowsSwitch: true,
      now,
    });
    const evasionDecision = routeCodexTaskByCapacity({
      inputRefSeed: 'input-ref',
      currentAccountHash: exhaustedCurrent.accountHash,
      authorizedAccounts: [exhaustedCurrent, availableTarget],
      policyAllowsSwitch: true,
      requestedMemberMutationForCapacity: true,
      now,
    });

    expect(switchDecision.routingStrategy).toBe('switch_authorized_account');
    expect(switchDecision.accountSwitchRequired).toBe(true);
    expect(switchDecision.approvalRequired).toBe(true);
    expect(evasionDecision.status).toBe('blocked');
    expect(evasionDecision.blockReasons).toContain('quota_evasion_blocked');
  });

  it('blocks member mutations without delegated-admin authority and keeps Claude repair bounded', () => {
    const memberMutation = createWorkspaceMemberActionEvidence({
      actionKind: 'member_add',
      workspaceSeed: 'workspace-a',
      memberSeed: 'member-a',
      antiEvasionPassed: false,
      now,
    });
    const repair = createClaudeCodeRepairRun({
      failureEvidenceSeed: adversarialPublicOutputFixture,
      controlledWorktreeSeed: adversarialPublicOutputFixture,
      proposalSeed: adversarialPublicOutputFixture,
      diffSeed: adversarialPublicOutputFixture,
      now,
    });

    expect(memberMutation.status).toBe('blocked');
    expect(memberMutation.blockReasons).toContain('delegated_admin_authority_required');
    expect(memberMutation.blockReasons).toContain('quota_evasion_blocked');
    expect(repair.productionClientOperationInvoked).toBe(false);
    expect(repair.accountSwitchInvoked).toBe(false);
    expect(repair.workspaceMemberMutationInvoked).toBe(false);
    expect(findAdversarialPublicOutputRoundTripLeaks([memberMutation, repair])).toEqual([]);
  });

  it('rejects raw production request materials', () => {
    expect(containsForbiddenM75RequestBody({ rawSelector: '#composer' })).toBe(true);
    expect(containsForbiddenM75RequestBody({ rawPrompt: 'do this task' })).toBe(true);
    expect(containsForbiddenM75RequestBody({ authority: { allowed: true } })).toBe(true);
    expect(containsForbiddenM75RequestBody({ inputRefId: 'input_ref_1' })).toBe(false);
  });
});

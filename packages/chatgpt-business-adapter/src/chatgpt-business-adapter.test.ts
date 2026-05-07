import { describe, expect, it } from 'vitest';
import {
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from '@codexhub/capability-adapter-kernel';
import {
  BusinessMembershipMirrorSchema,
  BusinessWorkspaceSchema,
  QuotaSnapshotSchema,
} from '@codexhub/contracts';
import {
  checkChatGptBusinessWorkspaceIdentity,
  createChatGptBusinessAdapterManifest,
  createChatGptBusinessAdapterPlan,
  planChatGptBusinessAdminDryRun,
  readChatGptBusinessQuotaFromFixture,
  syncChatGptBusinessMembershipFixture,
} from './index';

describe('chatgpt-business-adapter', () => {
  it('creates a read-only fixture-first capability manifest', () => {
    const manifest = createChatGptBusinessAdapterManifest();

    expect(manifest.name).toBe('chatgpt-business-adapter');
    expect(manifest.kind).toBe('codex');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.fixtureOnly).toBe(true);
    expect(manifest.metadata?.liveAdminEnabled).toBe(false);
    expect(validateCapabilityManifest(manifest).ok).toBe(true);
  });

  it('plans read-only fixture access without process or write boundaries', () => {
    const plan = createChatGptBusinessAdapterPlan({
      dryRunId: 'business_dry_run_1',
      workspaceKey: 'workspace-private-key',
      expectedMemberCount: 2,
    });

    expect(plan.status).toBe('ready');
    expect(plan.workspaceHash).toMatch(/^sha256:/);
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.bodyStored).toBe(false);
    expect(validateCapabilityPlanEnvelope(plan).ok).toBe(true);
    expect(JSON.stringify(plan)).not.toContain('workspace-private-key');
  });

  it('mirrors successful members and isolates one failed account fixture', () => {
    const result = syncChatGptBusinessMembershipFixture({
      workspaceKey: 'acme-business-workspace',
      workspaceName: 'Acme Private Workspace',
      evidenceRefIds: ['evidence_business_1'],
      auditEventIds: ['audit_business_1'],
      workspaceQuota: {
        status: 'available',
        limitCount: 100,
        usedCount: 25,
        remainingCount: 75,
        resetAt: '2026-05-08T00:00:00.000Z',
      },
      members: [
        {
          memberKey: 'member-owner-private',
          email: 'owner@example.test',
          displayName: 'Owner Name',
          role: 'owner',
          status: 'active',
          codexAccountKey: 'codex-owner-private',
          quota: {
            status: 'limited',
            limitCount: 10,
            usedCount: 9,
            remainingCount: 1,
          },
        },
        {
          memberKey: 'member-failed-private',
          email: 'failed@example.test',
          role: 'member',
          fail: true,
          failureCode: 'fixture-read-failed',
        },
      ],
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('partial');
    expect(result.counts).toEqual({
      requestedMembers: 2,
      mirroredMembers: 1,
      failedMembers: 1,
      quotaSnapshots: 2,
    });
    expect(result.memberships).toHaveLength(1);
    expect(result.accountBindings).toHaveLength(1);
    expect(result.failedMembers[0]?.memberHash).toMatch(/^sha256:/);
    expect(BusinessWorkspaceSchema.safeParse(result.workspace).success).toBe(true);
    expect(BusinessMembershipMirrorSchema.safeParse(result.memberships[0]).success).toBe(true);
    expect(QuotaSnapshotSchema.safeParse(result.quotaSnapshots[0]).success).toBe(true);
    expect(serialized).not.toContain('acme-business-workspace');
    expect(serialized).not.toContain('Acme Private Workspace');
    expect(serialized).not.toContain('owner@example.test');
    expect(serialized).not.toContain('failed@example.test');
    expect(serialized).not.toContain('member-owner-private');
    expect(serialized).not.toContain('codex-owner-private');
    expect(serialized).not.toContain('fixture-read-failed');
    expect(serialized).not.toContain('2026-05-08T00:00:00.000Z');
  });

  it('blocks membership sync when all account fixtures fail', () => {
    const result = syncChatGptBusinessMembershipFixture({
      workspaceKey: 'blocked-workspace-private',
      members: [
        {
          memberKey: 'member-a-private',
          fail: true,
          failureCode: 'read-failed-a',
        },
        {
          memberKey: 'member-b-private',
          fail: true,
          failureCode: 'read-failed-b',
        },
      ],
    });

    expect(result.status).toBe('blocked');
    expect(result.memberships).toHaveLength(0);
    expect(result.accountBindings).toHaveLength(0);
    expect(result.counts.failedMembers).toBe(2);
    expect(JSON.stringify(result)).not.toContain('blocked-workspace-private');
    expect(JSON.stringify(result)).not.toContain('read-failed-a');
  });

  it('checks workspace identity by hash only', () => {
    const matched = checkChatGptBusinessWorkspaceIdentity({
      workspaceKey: 'workspace-actual-private',
      expectedWorkspaceKey: 'workspace-actual-private',
      workspaceName: 'Private Workspace',
    });
    const mismatch = checkChatGptBusinessWorkspaceIdentity({
      workspaceKey: 'workspace-actual-private',
      expectedWorkspaceKey: 'workspace-expected-private',
    });

    expect(matched.status).toBe('matched');
    expect(mismatch.status).toBe('mismatch');
    expect(matched.workspaceHash).toMatch(/^sha256:/);
    expect(JSON.stringify([matched, mismatch])).not.toContain('workspace-actual-private');
    expect(JSON.stringify([matched, mismatch])).not.toContain('workspace-expected-private');
    expect(JSON.stringify([matched, mismatch])).not.toContain('Private Workspace');
  });

  it('reads Business quota from fixture metadata only', () => {
    const quota = readChatGptBusinessQuotaFromFixture({
      subjectKind: 'business-workspace',
      subjectKey: 'workspace-quota-private',
      status: 'available',
      limitCount: 50,
      usedCount: 12,
      remainingCount: 38,
      resetAt: '2026-05-09T00:00:00.000Z',
      sourceRefIds: ['source_ref_1'],
    });

    expect(quota.subjectHash).toMatch(/^sha256:/);
    expect(quota.limitCount).toBe(50);
    expect(quota.resetAtHash).toMatch(/^sha256:/);
    expect(JSON.stringify(quota)).not.toContain('workspace-quota-private');
    expect(JSON.stringify(quota)).not.toContain('2026-05-09T00:00:00.000Z');
  });

  it('keeps invite, remove, and replace admin helpers dry-run blocked', () => {
    const plans = [
      planChatGptBusinessAdminDryRun({
        dryRunId: 'business_admin_invite',
        operation: 'invite',
        workspaceKey: 'workspace-admin-private',
        memberKey: 'invitee-private',
      }),
      planChatGptBusinessAdminDryRun({
        dryRunId: 'business_admin_remove',
        operation: 'remove',
        workspaceKey: 'workspace-admin-private',
        memberKey: 'remove-private',
        liveAdminEnabled: true,
      }),
      planChatGptBusinessAdminDryRun({
        dryRunId: 'business_admin_replace',
        operation: 'replace',
        workspaceKey: 'workspace-admin-private',
        memberKey: 'old-private',
        replacementMemberKey: 'new-private',
      }),
    ];

    for (const plan of plans) {
      expect(plan.status).toBe('blocked');
      expect(plan.approvalRequired).toBe(true);
      expect(plan.liveAdminEnabled).toBe(false);
      expect(plan.executionDisabled).toBe(true);
      expect(plan.processBoundaryInvoked).toBe(false);
      expect(plan.externalProcessStarted).toBe(false);
      expect(plan.capabilityDryRun.plannedActions[0]?.actionMode).toBe('admin');
      expect(plan.capabilityDryRun.plannedActions[0]?.requiresApproval).toBe(true);
      expect(validateCapabilityPlanEnvelope(plan).ok).toBe(true);
    }

    expect(JSON.stringify(plans)).not.toContain('workspace-admin-private');
    expect(JSON.stringify(plans)).not.toContain('invitee-private');
    expect(JSON.stringify(plans)).not.toContain('old-private');
    expect(JSON.stringify(plans)).not.toContain('new-private');
  });
});

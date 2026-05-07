import { describe, expect, it } from 'vitest';
import {
  BROWSER_PROFILE_FORBIDDEN_ACTIONS,
  BROWSER_PROFILE_READ_ONLY_CAPABILITIES,
  createChatGptProfileHealthCheck,
  createChromeProfileRegistrationDryRun,
  createBrowserProfileReadiness,
  createBrowserProfileRef,
  createBrowserProfileRegistrySummary,
  hashBrowserProfilePath,
  lockChromeProfileBinding,
  rehearseChromeProfileWorkspaceQuotaReadiness,
} from './index';

describe('browser-profile-kernel', () => {
  it('hashes profile paths and never exposes raw profile paths in public refs', () => {
    const profilePath = 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default';
    const ref = createBrowserProfileRef({
      profileId: 'default',
      displayName: 'Default',
      profilePath,
      metadata: {
        profilePath,
        nested: {
          configPath: 'C:\\Users\\Thomas\\secret-config.json',
        },
      },
    });

    expect(ref.profilePathHash).toBe(hashBrowserProfilePath(profilePath));
    expect(ref.profilePathHash).toMatch(/^sha256:/);
    expect(ref.rawPathStored).toBe(false);
    expect(JSON.stringify(ref)).not.toContain(profilePath);
    expect(JSON.stringify(ref.metadata)).not.toContain('secret-config.json');
  });

  it('creates blocked readiness without probing or connecting to browsers', () => {
    const ref = createBrowserProfileRef({
      profileId: 'default',
      displayName: 'Default',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
    });
    const readiness = createBrowserProfileReadiness({ profileRef: ref });

    expect(readiness.status).toBe('blocked');
    expect(readiness.blockReasons).toEqual([
      'browser_connection_disabled',
      'profile_probe_disabled',
    ]);
    expect(readiness.allowedCapabilities).toEqual([...BROWSER_PROFILE_READ_ONLY_CAPABILITIES]);
    expect(readiness.forbiddenActions).toEqual([...BROWSER_PROFILE_FORBIDDEN_ACTIONS]);
    expect(readiness.processBoundaryInvoked).toBe(false);
    expect(readiness.externalProcessStarted).toBe(false);
    expect(readiness.noRealWrite).toBe(true);
    expect(readiness.bodyStored).toBe(false);
  });

  it('summarizes registry refs as metadata-only', () => {
    const ref = createBrowserProfileRef({
      profileId: 'default',
      displayName: 'Default',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
    });
    const registry = createBrowserProfileRegistrySummary([ref]);

    expect(registry.profileCount).toBe(1);
    expect(registry.rawPathStored).toBe(false);
    expect(registry.bodyStored).toBe(false);
    expect(registry.processBoundaryInvoked).toBe(false);
    expect(registry.externalProcessStarted).toBe(false);
  });

  it('registers Chrome profile bindings as dry-run hash-only metadata', () => {
    const profilePath = 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Profile 7';
    const registration = createChromeProfileRegistrationDryRun({
      profileId: 'profile-7',
      displayName: 'Private Profile',
      profilePath,
      accountKey: 'account-private-key',
      workspaceKey: 'workspace-private-key',
      evidenceRefIds: ['evidence_profile_1'],
      auditEventIds: ['audit_profile_1'],
    });
    const serialized = JSON.stringify(registration);

    expect(registration.status).toBe('ready');
    expect(registration.dryRunOnly).toBe(true);
    expect(registration.profileBinding.profilePathHash).toBe(hashBrowserProfilePath(profilePath));
    expect(registration.profileBinding.accountHash).toMatch(/^sha256:/);
    expect(registration.profileBinding.workspaceIdHash).toMatch(/^sha256:/);
    expect(registration.browserStorageRead).toBe(false);
    expect(registration.externalProcessStarted).toBe(false);
    expect(serialized).not.toContain(profilePath);
    expect(serialized).not.toContain('Private Profile');
    expect(serialized).not.toContain('account-private-key');
    expect(serialized).not.toContain('workspace-private-key');
  });

  it('locks Chrome profile bindings through metadata leases only', () => {
    const registration = createChromeProfileRegistrationDryRun({
      profileId: 'default',
      displayName: 'Default',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
    });
    const lock = lockChromeProfileBinding({
      profileBinding: registration.profileBinding,
      holderKey: 'operator-private-holder',
      expiresAt: '2026-05-08T00:00:00.000Z',
    });

    expect(lock.locked).toBe(true);
    expect(lock.profileBinding.locked).toBe(true);
    expect(lock.profileBinding.lockId).toBe(lock.lease.id);
    expect(lock.lease.targetKind).toBe('profile');
    expect(lock.lease.status).toBe('active');
    expect(lock.lease.leaseSecretStored).toBe(false);
    expect(lock.externalProcessStarted).toBe(false);
    expect(JSON.stringify(lock)).not.toContain('operator-private-holder');
  });

  it('creates ChatGPT profile health and human checkpoints without reading browser storage', () => {
    const registration = createChromeProfileRegistrationDryRun({
      profileId: 'default',
      displayName: 'Default',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
      accountKey: 'actual-account-private',
      workspaceKey: 'actual-workspace-private',
    });
    const healthy = createChatGptProfileHealthCheck({
      profileBinding: registration.profileBinding,
      accountKey: 'actual-account-private',
      expectedAccountKey: 'actual-account-private',
      workspaceKey: 'actual-workspace-private',
      expectedWorkspaceKey: 'actual-workspace-private',
    });
    const mismatch = createChatGptProfileHealthCheck({
      profileBinding: registration.profileBinding,
      accountKey: 'actual-account-private',
      expectedAccountKey: 'expected-account-private',
      workspaceKey: 'actual-workspace-private',
      expectedWorkspaceKey: 'actual-workspace-private',
    });
    const checkpoint = createChatGptProfileHealthCheck({
      profileBinding: registration.profileBinding,
      status: 'mfa_required',
    });
    const serialized = JSON.stringify([healthy, mismatch, checkpoint]);

    expect(healthy.health.status).toBe('healthy');
    expect(healthy.checkpoint).toBeUndefined();
    expect(mismatch.health.status).toBe('wrong_account');
    expect(mismatch.checkpoint?.checkpointKind).toBe('account_select_required');
    expect(checkpoint.health.status).toBe('mfa_required');
    expect(checkpoint.checkpoint?.checkpointKind).toBe('mfa_required');
    expect(mismatch.browserStorageRead).toBe(false);
    expect(mismatch.rawPathStored).toBe(false);
    expect(serialized).not.toContain('actual-account-private');
    expect(serialized).not.toContain('expected-account-private');
    expect(serialized).not.toContain('actual-workspace-private');
  });

  it('rehearses profile workspace and quota readiness without raw path or reset output', () => {
    const rehearsal = rehearseChromeProfileWorkspaceQuotaReadiness({
      profileId: 'default',
      displayName: 'Default',
      profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
      accountKey: 'account-private',
      expectedAccountKey: 'account-private',
      workspaceKey: 'workspace-private',
      expectedWorkspaceKey: 'workspace-private',
      quotaStatus: 'exhausted',
      quotaLimitCount: 20,
      quotaUsedCount: 20,
      quotaRemainingCount: 0,
      quotaResetAt: '2026-05-09T00:00:00.000Z',
    });
    const serialized = JSON.stringify(rehearsal);

    expect(rehearsal.status).toBe('blocked');
    expect(rehearsal.health.status).toBe('healthy');
    expect(rehearsal.quotaSnapshot?.status).toBe('exhausted');
    expect(rehearsal.counts.quotaSnapshotCount).toBe(1);
    expect(rehearsal.browserStorageRead).toBe(false);
    expect(rehearsal.rawPathStored).toBe(false);
    expect(rehearsal.externalProcessStarted).toBe(false);
    expect(serialized).not.toContain('C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default');
    expect(serialized).not.toContain('workspace-private');
    expect(serialized).not.toContain('2026-05-09T00:00:00.000Z');
  });
});

import { describe, expect, it } from 'vitest';
import {
  BROWSER_PROFILE_FORBIDDEN_ACTIONS,
  BROWSER_PROFILE_READ_ONLY_CAPABILITIES,
  createBrowserProfileReadiness,
  createBrowserProfileRef,
  createBrowserProfileRegistrySummary,
  hashBrowserProfilePath,
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
});

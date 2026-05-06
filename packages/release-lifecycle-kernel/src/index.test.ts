import { describe, expect, it } from 'vitest';
import {
  GithubRemoteRefSummarySchema,
  SchemaVersionSchema,
  foundationTimestamp,
} from '@codexhub/contracts';
import {
  createGithubReleaseDraftPlan,
  createGithubReleaseTagPlan,
  createReleaseChangelogSummary,
  createReleaseVersionPlan,
  runReleaseLifecycleAcceptanceRehearsal,
} from './index';

describe('release-lifecycle-kernel', () => {
  it('creates metadata-only release plans and rehearsals', () => {
    const createdAt = foundationTimestamp();
    const targetRef = GithubRemoteRefSummarySchema.parse({
      id: 'target',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      hostHash: 'sha256:host',
      ownerHash: 'sha256:owner',
      repoHash: 'sha256:repo',
      baseBranchHash: 'sha256:main',
      allowedHost: 'api.github.com',
      rawOwnerStored: false,
      rawRepoStored: false,
      rawRefStored: false,
      rawUrlStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Target stores hashes only.',
    });
    const versionPlan = createReleaseVersionPlan({
      currentVersion: '1.2.3',
      proposedVersion: '1.3.0',
    });
    const changelog = createReleaseChangelogSummary({
      changelogBody: 'raw fixture body is hashed before leaving the kernel',
    });
    const tagPlan = createGithubReleaseTagPlan({
      targetRef,
      tagName: 'v1.3.0',
      versionPlan,
      changelogSummary: changelog,
    });
    const draftPlan = createGithubReleaseDraftPlan({
      targetRef,
      tagName: 'v1.3.0',
      releaseBody: 'raw draft body is hashed before leaving the kernel',
      changelogSummary: changelog,
    });
    const rehearsal = runReleaseLifecycleAcceptanceRehearsal({ scenario: 'all-pass' });
    const serialized = JSON.stringify([versionPlan, changelog, tagPlan, draftPlan, rehearsal]);

    expect(tagPlan.networkBoundaryPlanned).toBe(true);
    expect(draftPlan.draft).toBe(true);
    expect(rehearsal.status).toBe('passed');
    expect(serialized).not.toContain('raw fixture body');
    expect(serialized).not.toContain('raw draft body');
  });
});

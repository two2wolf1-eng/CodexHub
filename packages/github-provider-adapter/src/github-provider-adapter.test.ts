import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  GithubMetadataDryRunRecordSchema,
  GithubTokenReadinessSchema,
} from '@codexhub/contracts';
import {
  GITHUB_PROVIDER_MANIFEST,
  createGithubMetadataDryRunRecord,
  createGithubProviderManifest,
  createGithubRemoteRefSummary,
  readGithubTokenReadiness,
} from './index';

const fixedNow = () => '2026-05-04T00:00:00.000Z';

describe('github-provider-adapter M15a foundation', () => {
  it('declares an external-network manifest with no process boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createGithubProviderManifest(fixedNow));

    expect(manifest).toEqual(GITHUB_PROVIDER_MANIFEST);
    expect(manifest.kind).toBe('git');
    expect(manifest.provider).toBe('external-network');
    expect(manifest.requiresApprovalByDefault).toBe(true);
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
  });

  it('reports token readiness as configured/hash-only or missing without exposing the value', () => {
    const configured = readGithubTokenReadiness(
      { CODEXHUB_GITHUB_TOKEN: 'ghp_example_secret' },
      fixedNow,
    );
    const missing = readGithubTokenReadiness({}, fixedNow);
    const serialized = JSON.stringify([configured, missing]);

    expect(GithubTokenReadinessSchema.parse(configured).tokenConfigured).toBe(true);
    expect(configured.tokenHash).toMatch(/^sha256:/);
    expect(missing.tokenConfigured).toBe(false);
    expect(missing.tokenHash).toBeUndefined();
    expect(serialized).not.toContain('ghp_example_secret');
    expect(serialized).not.toContain('CODEXHUB_GITHUB_TOKEN');
  });

  it('creates remote ref summaries with hashes only', () => {
    const ref = createGithubRemoteRefSummary({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      now: fixedNow,
    });
    const serialized = JSON.stringify(ref);

    expect(ref.ownerHash).toMatch(/^sha256:/);
    expect(ref.repoHash).toMatch(/^sha256:/);
    expect(ref.baseBranchHash).toMatch(/^sha256:/);
    expect(ref.headBranchHash).toMatch(/^sha256:/);
    expect(ref.rawOwnerStored).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m15');
  });

  it('plans metadata observation without invoking network or process boundaries', () => {
    const plan = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      now: fixedNow,
    });

    expect(GithubMetadataDryRunRecordSchema.parse(plan).status).toBe('planned');
    expect(plan.runnerMode).toBe('planning-only');
    expect(plan.networkBoundaryPlanned).toBe(false);
    expect(plan.networkBoundaryInvoked).toBe(false);
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.requiresApproval).toBe(true);
  });

  it('blocks unsafe remote ref input before any boundary is planned', () => {
    const plan = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: '../codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      runnerMode: 'controlled-github-http',
      now: fixedNow,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('invalid_repo');
    expect(plan.networkBoundaryPlanned).toBe(false);
  });
});

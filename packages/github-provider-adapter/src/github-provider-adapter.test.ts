import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  GithubMetadataDryRunRecordSchema,
  GithubTokenReadinessSchema,
} from '@codexhub/contracts';
import {
  GITHUB_PROVIDER_MANIFEST,
  createGithubMetadataApprovalRecord,
  createGithubMetadataDryRunRecord,
  createGithubProviderManifest,
  createGithubRemoteRefSummary,
  executeGithubMetadataObservation,
  readGithubTokenReadiness,
} from './index';

const fixedNow = () => '2026-05-04T00:00:00.000Z';
const allowedAuthority = {
  id: 'execution_authority_github_metadata',
  schemaVersion: '2026-04-28.foundation' as const,
  createdAt: '2026-05-04T00:00:00.000Z',
  policyDecisionId: 'policy_github_metadata',
  allowed: true,
  constraints: ['hash-bound-github-metadata'],
};

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

  it('blocks execution before the network boundary without authority, approval, or enablement', async () => {
    const dryRunRecord = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      runnerMode: 'controlled-github-http',
      now: fixedNow,
    });
    let fetchCalled = false;
    const run = await executeGithubMetadataObservation({
      dryRunRecord,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
        token: 'ghp_secret',
      },
      fetchImpl: async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      },
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('github_provider_disabled');
    expect(run.blockReasons).toContain('missing_persisted_approval');
    expect(run.blockReasons).toContain('execution_authority_denied');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('runs controlled metadata GETs through the injected boundary and stores hashes only', async () => {
    const dryRunRecord = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      runnerMode: 'controlled-github-http',
      now: fixedNow,
    });
    const approvalRecord = createGithubMetadataApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const requestedUrls: string[] = [];
    const fetchImpl = (async (url: string) => {
      requestedUrls.push(url);
      const body = url.includes('/pulls?') ? '[{"number":1}]' : '{"ok":true}';

      return {
        ok: true,
        status: 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubMetadataObservation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.responseBodyHashes).toHaveLength(4);
    expect(run.existingPullRequestCount).toBe(1);
    expect(requestedUrls).toEqual([
      'https://api.github.com/repos/octo-org/codexhub',
      'https://api.github.com/repos/octo-org/codexhub/branches/main',
      'https://api.github.com/repos/octo-org/codexhub/branches/codex%2Fm15',
      'https://api.github.com/repos/octo-org/codexhub/pulls?state=open&base=main&head=octo-org%3Acodex%2Fm15',
    ]);
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m15');
    expect(serialized).not.toContain('{"ok":true}');
  });

  it('blocks hash-mismatched runtime refs before the network boundary', async () => {
    const dryRunRecord = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      runnerMode: 'controlled-github-http',
      now: fixedNow,
    });
    const approvalRecord = createGithubMetadataApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubMetadataObservation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'different',
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('github_remote_ref_hash_mismatch');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('blocks expired persisted approvals before the network boundary', async () => {
    const dryRunRecord = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m15',
      runnerMode: 'controlled-github-http',
      now: fixedNow,
    });
    const approvalRecord = {
      ...createGithubMetadataApprovalRecord({
        dryRunRecord,
        status: 'approved',
        now: fixedNow,
      }),
      expiresAt: '2026-05-03T00:00:00.000Z',
    };
    let fetchCalled = false;

    const run = await executeGithubMetadataObservation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('approval_artifact_expired');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });
});

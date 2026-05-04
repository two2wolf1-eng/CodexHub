import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  GithubBranchPublishPlanSchema,
  GithubDraftPrPlanSchema,
  GithubMetadataDryRunRecordSchema,
  GithubPublishDraftPrChainPlanSchema,
  GithubTokenReadinessSchema,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  GITHUB_PROVIDER_MANIFEST,
  createGithubBranchPublishApprovalRecord,
  createGithubBranchPublishPlan,
  createGithubDraftPrApprovalRecord,
  createGithubDraftPrPlan,
  createGithubMetadataApprovalRecord,
  createGithubMetadataDryRunRecord,
  createGithubProviderManifest,
  createGithubPublishDraftPrChainPlan,
  createGithubPublishDraftPrChainRun,
  createGithubRemotePrLifecycleSummary,
  createGithubRemoteRefSummary,
  executeGithubBranchPublish,
  executeGithubDraftPrCreation,
  executeGithubMetadataObservation,
  readGithubTokenReadiness,
  runGithubBranchPublishAcceptanceRehearsal,
  runGithubDraftPrAcceptanceRehearsal,
  runGithubPublishDraftPrAcceptanceRehearsal,
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
const hash = (value: string) => `sha256:${hashText(value)}`;
const branchPublishFiles = [
  {
    relativePath: 'packages/example/src/index.ts',
    content: 'export const answer = 42;\n',
  },
  {
    relativePath: 'docs/example.md',
    content: '# Example\n\nMetadata only.\n',
  },
];
const branchPublishFileInputs = branchPublishFiles.map((file) => ({
  relativePath: file.relativePath,
  contentHash: hash(file.content),
  byteCount: Buffer.byteLength(file.content, 'utf8'),
  text: true,
}));

async function createCompletedBranchPublishRun() {
  const dryRunRecord = createGithubBranchPublishPlan({
    owner: 'octo-org',
    repo: 'codexhub',
    baseBranch: 'main',
    sourceKind: 'local_rc_readiness',
    sourceId: 'local_rc_123',
    sourceSummary: 'Local RC passed review and verification.',
    worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
    branchSlug: 'm17-publish',
    commitMessageSummary: 'Publish governed CodexHub patch',
    files: branchPublishFileInputs,
    runnerMode: 'controlled-github-branch-publish',
    now: fixedNow,
  });
  const approvalRecord = createGithubBranchPublishApprovalRecord({
    dryRunRecord,
    status: 'approved',
    now: fixedNow,
  });
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    if (url.endsWith('/git/ref/heads/codexhub%2Fm17-publish')) {
      return {
        ok: false,
        status: 404,
        async text() {
          return '{"message":"Not Found"}';
        },
      };
    }

    const method = init?.method ?? 'GET';
    const body =
      method === 'GET' && url.endsWith('/git/ref/heads/main')
        ? '{"object":{"sha":"base-commit-sha"}}'
        : method === 'GET' && url.endsWith('/git/commits/base-commit-sha')
          ? '{"tree":{"sha":"base-tree-sha"}}'
          : method === 'POST' && url.endsWith('/git/blobs')
            ? '{"sha":"blob-sha"}'
            : method === 'POST' && url.endsWith('/git/trees')
              ? '{"sha":"new-tree-sha"}'
              : method === 'POST' && url.endsWith('/git/commits')
                ? '{"sha":"new-commit-sha"}'
                : '{"ok":true}';

    return {
      ok: true,
      status: method === 'POST' ? 201 : 200,
      async text() {
        return body;
      },
    };
  }) as unknown as typeof fetch;

  return executeGithubBranchPublish({
    dryRunRecord,
    approvalRecord,
    authority: allowedAuthority,
    enabled: true,
    runtime: {
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m17-publish',
      branchName: 'codexhub/m17-publish',
      commitMessage: 'Publish governed CodexHub patch',
      commitMessageSummary: 'Publish governed CodexHub patch',
      files: branchPublishFiles,
      token: 'ghp_secret',
    },
    fetchImpl,
    now: fixedNow,
  });
}

async function createCompletedDraftPrRun() {
  const dryRunRecord = createGithubDraftPrPlan({
    owner: 'octo-org',
    repo: 'codexhub',
    baseBranch: 'main',
    headBranch: 'codexhub/m17-publish',
    sourceKind: 'local_rc_readiness',
    sourceId: 'local_rc_123',
    sourceSummary: 'Local RC has passed verification and review.',
    titleSummary: 'Draft PR from local RC',
    bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
    remoteHeadBranchExists: true,
    existingPullRequestCount: 0,
    runnerMode: 'controlled-github-draft-pr',
    now: fixedNow,
  });
  const approvalRecord = createGithubDraftPrApprovalRecord({
    dryRunRecord,
    status: 'approved',
    now: fixedNow,
  });
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    const isPullRequestLookup = url.includes('/pulls?');
    const isPullRequestPost = init?.method === 'POST';
    const body = isPullRequestLookup
      ? '[]'
      : isPullRequestPost
        ? '{"number":42,"html_url":"https://github.com/octo-org/codexhub/pull/42"}'
        : '{"ok":true}';

    return {
      ok: true,
      status: isPullRequestPost ? 201 : 200,
      async text() {
        return body;
      },
    };
  }) as unknown as typeof fetch;

  return executeGithubDraftPrCreation({
    dryRunRecord,
    approvalRecord,
    authority: allowedAuthority,
    enabled: true,
    runtime: {
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m17-publish',
      titleSummary: 'Draft PR from local RC',
      bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
      token: 'ghp_secret',
    },
    fetchImpl,
    now: fixedNow,
  });
}

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

  it('plans new-branch publish with a hash-only content manifest', () => {
    const plan = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC passed review and verification.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-publish',
      commitMessageSummary: 'Publish governed CodexHub patch',
      files: branchPublishFileInputs,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    const serialized = JSON.stringify(plan);

    expect(GithubBranchPublishPlanSchema.parse(plan).status).toBe('planned');
    expect(plan.readiness.status).toBe('ready_for_branch_publish');
    expect(plan.requiresApproval).toBe(true);
    expect(plan.policyDecision.actionMode).toBe('write');
    expect(plan.policyDecision.outcome).toBe('approval_required');
    expect(plan.networkBoundaryPlanned).toBe(true);
    expect(plan.networkBoundaryInvoked).toBe(false);
    expect(plan.createRefAllowed).toBe(true);
    expect(plan.updateRefAllowed).toBe(false);
    expect(plan.forceAllowed).toBe(false);
    expect(plan.pushAllowed).toBe(false);
    expect(plan.mergeAllowed).toBe(false);
    expect(plan.readiness.contentManifest.fileCount).toBe(2);
    expect(plan.readiness.contentManifest.rawFileContentStored).toBe(false);
    expect(plan.readiness.contentManifest.rawPathStored).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('octo-org/codexhub');
    expect(serialized).not.toContain('m17-publish');
    expect(serialized).not.toContain('packages/example/src/index.ts');
    expect(serialized).not.toContain('export const answer');
    expect(serialized).not.toContain('Publish governed CodexHub patch');
  });

  it('blocks branch publish planning for unsafe branch or content input', () => {
    const unsafeBranch = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'review_package',
      sourceId: 'review_package_123',
      sourceSummary: 'Approved review package.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: '../main',
      commitMessageSummary: 'Publish governed patch',
      files: branchPublishFileInputs,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    const branchExists = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'review_package',
      sourceId: 'review_package_123',
      sourceSummary: 'Approved review package.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-existing',
      commitMessageSummary: 'Publish governed patch',
      files: branchPublishFileInputs,
      branchExists: true,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    const unsafeContent = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'patch_lifecycle',
      sourceId: 'patch_lifecycle_123',
      sourceSummary: 'Patch lifecycle verified.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-unsafe-content',
      commitMessageSummary: 'Publish governed patch',
      files: [
        {
          relativePath: '../secrets.txt',
          contentHash: hash('secret'),
          byteCount: 6,
          text: true,
        },
      ],
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });

    expect(unsafeBranch.status).toBe('blocked');
    expect(unsafeBranch.blockReasons).toContain('invalid_branch_slug');
    expect(unsafeBranch.networkBoundaryPlanned).toBe(false);
    expect(branchExists.status).toBe('blocked');
    expect(branchExists.readiness.status).toBe('blocked_existing_branch');
    expect(branchExists.blockReasons).toContain('remote_branch_exists');
    expect(unsafeContent.status).toBe('blocked');
    expect(unsafeContent.readiness.status).toBe('blocked_content_manifest');
    expect(unsafeContent.blockReasons).toContain('content_manifest_unsafe');
  });

  it('blocks branch publish execution before the network boundary without enablement or approval', async () => {
    const dryRunRecord = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC passed review and verification.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-publish',
      commitMessageSummary: 'Publish governed CodexHub patch',
      files: branchPublishFileInputs,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubBranchPublish({
      dryRunRecord,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m17-publish',
        branchName: 'codexhub/m17-publish',
        commitMessage: 'Publish governed CodexHub patch',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishFiles,
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('github_branch_publish_disabled');
    expect(run.blockReasons).toContain('missing_persisted_approval');
    expect(run.blockReasons).toContain('execution_authority_denied');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('publishes an approved branch through fixed Git Data API requests and stores hashes only', async () => {
    const dryRunRecord = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC passed review and verification.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-publish',
      commitMessageSummary: 'Publish governed CodexHub patch',
      files: branchPublishFileInputs,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    const approvalRecord = createGithubBranchPublishApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });

      if (url.endsWith('/git/ref/heads/codexhub%2Fm17-publish')) {
        return {
          ok: false,
          status: 404,
          async text() {
            return '{"message":"Not Found"}';
          },
        };
      }

      const method = init?.method ?? 'GET';
      const body =
        method === 'GET' && url.endsWith('/git/ref/heads/main')
          ? '{"object":{"sha":"base-commit-sha"}}'
          : method === 'GET' && url.endsWith('/git/commits/base-commit-sha')
            ? '{"tree":{"sha":"base-tree-sha"}}'
            : method === 'POST' && url.endsWith('/git/blobs')
              ? '{"sha":"blob-sha"}'
              : method === 'POST' && url.endsWith('/git/trees')
                ? '{"sha":"new-tree-sha"}'
                : method === 'POST' && url.endsWith('/git/commits')
                  ? '{"sha":"new-commit-sha"}'
                  : '{"ok":true}';

      return {
        ok: true,
        status: method === 'POST' ? 201 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubBranchPublish({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m17-publish',
        branchName: 'codexhub/m17-publish',
        commitMessage: 'Publish governed CodexHub patch',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishFiles,
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(run.commitSummary.created).toBe(true);
    expect(run.commitSummary.commitShaHash).toMatch(/^sha256:/);
    expect(run.commitSummary.treeShaHash).toMatch(/^sha256:/);
    expect(run.responseBodyHashes).toHaveLength(9);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/main',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codexhub%2Fm17-publish',
      'GET https://api.github.com/repos/octo-org/codexhub/git/commits/base-commit-sha',
      'POST https://api.github.com/repos/octo-org/codexhub/git/blobs',
      'POST https://api.github.com/repos/octo-org/codexhub/git/blobs',
      'POST https://api.github.com/repos/octo-org/codexhub/git/trees',
      'POST https://api.github.com/repos/octo-org/codexhub/git/commits',
      'POST https://api.github.com/repos/octo-org/codexhub/git/refs',
    ]);
    expect(requested.filter((request) => request.url.endsWith('/git/blobs'))).toHaveLength(2);
    expect(requested.at(-1)?.body).toContain('"refs/heads/codexhub/m17-publish"');
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m17-publish');
    expect(serialized).not.toContain('Publish governed CodexHub patch');
    expect(serialized).not.toContain('export const answer');
    expect(serialized).not.toContain('packages/example/src/index.ts');
    expect(serialized).not.toContain('base-commit-sha');
    expect(serialized).not.toContain('new-commit-sha');
  });

  it('blocks branch publish on runtime content mismatch before the network boundary', async () => {
    const dryRunRecord = createGithubBranchPublishPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC passed review and verification.',
      worktreePathHash: hash('../CodexHub-worktrees/codexhub-m17'),
      branchSlug: 'm17-publish',
      commitMessageSummary: 'Publish governed CodexHub patch',
      files: branchPublishFileInputs,
      runnerMode: 'controlled-github-branch-publish',
      now: fixedNow,
    });
    const approvalRecord = createGithubBranchPublishApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubBranchPublish({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m17-publish',
        branchName: 'codexhub/m17-publish',
        commitMessage: 'Publish governed CodexHub patch',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: [{ ...branchPublishFiles[0], content: 'mutated\n' }, branchPublishFiles[1]],
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('content_manifest_hash_mismatch');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('runs branch publish acceptance rehearsal as fixture-only metadata', () => {
    const passed = runGithubBranchPublishAcceptanceRehearsal({
      scenario: 'all-pass',
      now: fixedNow,
    });
    const branchExists = runGithubBranchPublishAcceptanceRehearsal({
      scenario: 'branch-exists',
      now: fixedNow,
    });
    const blobFailed = runGithubBranchPublishAcceptanceRehearsal({
      scenario: 'blob-create-failed',
      now: fixedNow,
    });
    const aborted = runGithubBranchPublishAcceptanceRehearsal({
      scenario: 'network-timeout',
      now: fixedNow,
    });
    const serialized = JSON.stringify([passed, branchExists, blobFailed, aborted]);

    expect(passed.status).toBe('passed');
    expect(passed.branchPublishStatus).toBe('fixture_completed');
    expect(branchExists.status).toBe('blocked');
    expect(branchExists.readinessStatus).toBe('blocked_existing_branch');
    expect(blobFailed.status).toBe('failed');
    expect(aborted.status).toBe('aborted');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.processBoundaryInvoked).toBe(false);
    expect(passed.externalProcessStarted).toBe(false);
    expect(passed.noRealWrite).toBe(true);
    expect(passed.createRefAllowed).toBe(true);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw file content');
    expect(serialized).not.toContain('Authorization');
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

  it('plans existing-branch draft PR creation with metadata hashes only', () => {
    const plan = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC has passed verification and review.',
      titleSummary: 'Draft PR: governed CodexHub change',
      bodySectionSummaries: [
        'Summary section from approved metadata',
        'Verification section from hash-only gate',
      ],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 0,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });
    const serialized = JSON.stringify(plan);

    expect(GithubDraftPrPlanSchema.parse(plan).status).toBe('planned');
    expect(plan.readiness.status).toBe('ready_for_draft_pr');
    expect(plan.requiresApproval).toBe(true);
    expect(plan.policyDecision.actionMode).toBe('write');
    expect(plan.policyDecision.outcome).toBe('approval_required');
    expect(plan.networkBoundaryPlanned).toBe(true);
    expect(plan.networkBoundaryInvoked).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.titleHash).toMatch(/^sha256:/);
    expect(plan.bodyHash).toMatch(/^sha256:/);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m16-draft');
    expect(serialized).not.toContain('Draft PR: governed CodexHub change');
    expect(serialized).not.toContain('Summary section from approved metadata');
  });

  it('blocks draft PR planning when the remote head branch is missing', () => {
    const plan = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'review_package',
      sourceId: 'review_package_123',
      sourceSummary: 'Review package is approved for local RC.',
      titleSummary: 'Draft PR from review package',
      bodySectionSummaries: ['Review summary'],
      remoteHeadBranchExists: false,
      existingPullRequestCount: 0,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.readiness.status).toBe('blocked_head_branch');
    expect(plan.blockReasons).toContain('remote_head_branch_missing');
    expect(plan.networkBoundaryPlanned).toBe(false);
  });

  it('blocks draft PR planning when an existing PR is found', () => {
    const plan = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC has passed verification and review.',
      titleSummary: 'Draft PR from local RC',
      bodySectionSummaries: ['Local RC summary'],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 1,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.readiness.status).toBe('blocked_existing_pr');
    expect(plan.blockReasons).toContain('existing_pull_request_found');
    expect(plan.networkBoundaryPlanned).toBe(false);
  });

  it('blocks draft PR creation before the network boundary without enablement and approval', async () => {
    const dryRunRecord = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC has passed verification and review.',
      titleSummary: 'Draft PR from local RC',
      bodySectionSummaries: ['Local RC summary'],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 0,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubDraftPrCreation({
      dryRunRecord,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary'],
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('github_draft_pr_disabled');
    expect(run.blockReasons).toContain('missing_persisted_approval');
    expect(run.blockReasons).toContain('execution_authority_denied');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('creates an approved draft PR through fixed GitHub requests and stores hashes only', async () => {
    const dryRunRecord = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC has passed verification and review.',
      titleSummary: 'Draft PR from local RC',
      bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 0,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });
    const approvalRecord = createGithubDraftPrApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const isPullRequestLookup = url.includes('/pulls?');
      const isPullRequestPost = init?.method === 'POST';
      const body = isPullRequestLookup
        ? '[]'
        : isPullRequestPost
          ? '{"number":42,"html_url":"https://github.com/octo-org/codexhub/pull/42"}'
          : '{"ok":true}';

      return {
        ok: true,
        status: isPullRequestPost ? 201 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubDraftPrCreation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(run.creationSummary.created).toBe(true);
    expect(run.creationSummary.prNumberHash).toMatch(/^sha256:/);
    expect(run.creationSummary.prUrlHash).toMatch(/^sha256:/);
    expect(run.responseBodyHashes).toHaveLength(5);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/branches/main',
      'GET https://api.github.com/repos/octo-org/codexhub/branches/codex%2Fm16-draft',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls?state=open&base=main&head=octo-org%3Acodex%2Fm16-draft',
      'POST https://api.github.com/repos/octo-org/codexhub/pulls',
    ]);
    expect(requested.at(-1)?.body).toContain('"draft":true');
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m16-draft');
    expect(serialized).not.toContain('Draft PR from local RC');
    expect(serialized).not.toContain('Local RC summary');
    expect(serialized).not.toContain('https://github.com/octo-org/codexhub/pull/42');
  });

  it('blocks draft PR creation on runtime hash mismatch before the network boundary', async () => {
    const dryRunRecord = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m16-draft',
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      sourceSummary: 'Local RC has passed verification and review.',
      titleSummary: 'Draft PR from local RC',
      bodySectionSummaries: ['Local RC summary'],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 0,
      runnerMode: 'controlled-github-draft-pr',
      now: fixedNow,
    });
    const approvalRecord = createGithubDraftPrApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubDraftPrCreation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'different',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary'],
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

  it('runs draft PR acceptance rehearsal as fixture-only metadata', () => {
    const passed = runGithubDraftPrAcceptanceRehearsal({
      scenario: 'all-pass',
      now: fixedNow,
    });
    const blocked = runGithubDraftPrAcceptanceRehearsal({
      scenario: 'head-branch-missing',
      now: fixedNow,
    });
    const failed = runGithubDraftPrAcceptanceRehearsal({
      scenario: 'github-post-failed',
      now: fixedNow,
    });
    const aborted = runGithubDraftPrAcceptanceRehearsal({
      scenario: 'network-timeout',
      now: fixedNow,
    });
    const serialized = JSON.stringify([passed, blocked, failed, aborted]);

    expect(passed.status).toBe('passed');
    expect(passed.prCreationStatus).toBe('fixture_completed');
    expect(blocked.status).toBe('blocked');
    expect(blocked.readinessStatus).toBe('blocked_head_branch');
    expect(failed.status).toBe('failed');
    expect(aborted.status).toBe('aborted');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.processBoundaryInvoked).toBe(false);
    expect(passed.externalProcessStarted).toBe(false);
    expect(passed.noRealWrite).toBe(true);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.createRefAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('Authorization');
  });

  it('plans a publish to draft PR chain with separate approvals and metadata only', () => {
    const plan = createGithubPublishDraftPrChainPlan({
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      branchPublishDryRunId: 'github_branch_publish_dry_run_1',
      draftPrDryRunId: 'github_draft_pr_dry_run_1',
      now: fixedNow,
    });
    const serialized = JSON.stringify(plan);

    expect(GithubPublishDraftPrChainPlanSchema.parse(plan).separateApprovalsRequired).toBe(
      true,
    );
    expect(plan.branchPublishApprovalRequired).toBe(true);
    expect(plan.draftPrApprovalRequired).toBe(true);
    expect(plan.networkBoundaryPlanned).toBe(true);
    expect(plan.noRealWrite).toBe(true);
    expect(serialized).not.toContain('local_rc_123');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m17-publish');
  });

  it('projects completed branch publish and draft PR child runs into a metadata-only chain', async () => {
    const branchPublishRun = await createCompletedBranchPublishRun();
    const draftPrRun = await createCompletedDraftPrRun();
    const plan = createGithubPublishDraftPrChainPlan({
      sourceKind: 'local_rc_readiness',
      sourceId: 'local_rc_123',
      branchPublishDryRunId: branchPublishRun.dryRunId,
      draftPrDryRunId: draftPrRun.dryRunId,
      now: fixedNow,
    });
    const lifecycleSummary = createGithubRemotePrLifecycleSummary({
      targetRef: draftPrRun.creationSummary.targetRef,
      prNumberHash: draftPrRun.creationSummary.prNumberHash,
      prUrlHash: draftPrRun.creationSummary.prUrlHash,
      stateSummary: 'checks_passed',
      checkRunCount: 2,
      passedCheckCount: 2,
      now: fixedNow,
    });

    const run = createGithubPublishDraftPrChainRun({
      plan,
      branchPublishRun,
      draftPrRun,
      lifecycleSummary,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.stepCount).toBe(3);
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(run.lifecycleSummary?.passedCheckCount).toBe(2);
    expect(run.steps.map((step) => step.status)).toEqual([
      'completed',
      'completed',
      'completed',
    ]);
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m17-publish');
    expect(serialized).not.toContain('https://github.com/octo-org/codexhub/pull/42');
    expect(serialized).not.toContain('export const answer');
  });

  it('blocks the publish to draft PR chain when branch publish is unavailable', () => {
    const plan = createGithubPublishDraftPrChainPlan({
      sourceKind: 'review_package',
      sourceId: 'review_package_123',
      branchPublishDryRunId: 'github_branch_publish_dry_run_1',
      draftPrDryRunId: 'github_draft_pr_dry_run_1',
      now: fixedNow,
    });

    const run = createGithubPublishDraftPrChainRun({ plan, now: fixedNow });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('missing_branch_publish_run');
    expect(run.steps[0].status).toBe('blocked');
    expect(run.steps[1].status).toBe('skipped');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(run.noRealWrite).toBe(true);
  });

  it('runs publish to draft PR acceptance rehearsal as fixture-only metadata', () => {
    const passed = runGithubPublishDraftPrAcceptanceRehearsal({
      scenario: 'all-pass',
      now: fixedNow,
    });
    const checksPassed = runGithubPublishDraftPrAcceptanceRehearsal({
      scenario: 'checks-passed',
      now: fixedNow,
    });
    const pending = runGithubPublishDraftPrAcceptanceRehearsal({
      scenario: 'draft-pr-created-checks-pending',
      now: fixedNow,
    });
    const failed = runGithubPublishDraftPrAcceptanceRehearsal({
      scenario: 'checks-failed',
      now: fixedNow,
    });
    const serialized = JSON.stringify([passed, checksPassed, pending, failed]);

    expect(passed.status).toBe('passed');
    expect(checksPassed.status).toBe('passed');
    expect(pending.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('Authorization');
  });
});

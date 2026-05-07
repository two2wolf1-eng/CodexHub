import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  runGithubActionsDispatchHttpBoundary,
  runGithubActionsObservationHttpBoundary,
  runGithubActionsRunControlHttpBoundary,
  runGithubMergeHttpBoundary,
  runGithubPrManagementHttpBoundary,
  runGithubReleaseDraftHttpBoundary,
  runGithubReleaseTagHttpBoundary,
  runGithubRemoteCleanupHttpBoundary,
} from './github-http-boundary';
import {
  CapabilityManifestSchema,
  GithubBranchPublishPlanSchema,
  GithubDraftPrPlanSchema,
  GithubMetadataDryRunRecordSchema,
  GithubMergeReadinessPlanSchema,
  GithubMergeRunSchema,
  GithubPrLifecycleObservationPlanSchema,
  GithubPrManagementPlanSchema,
  GithubPrManagementRunSchema,
  GithubPublishDraftPrChainPlanSchema,
  GithubRemoteCleanupPlanSchema,
  GithubRemoteCleanupRunSchema,
  GithubTokenReadinessSchema,
  RemoteSupersedePlanSchema,
  RemoteSupersedeRunSchema,
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
  createGithubMergeApprovalRecord,
  createGithubMergeReadinessPlan,
  createGithubPrLifecycleApprovalRecord,
  createGithubPrLifecycleObservationPlan,
  createGithubPrManagementApprovalRecord,
  createGithubPrManagementPlan,
  createGithubProviderManifest,
  createGithubRemoteCleanupApprovalRecord,
  createGithubRemoteCleanupPlan,
  createGithubPublishDraftPrChainPlan,
  createGithubPublishDraftPrChainRun,
  createGithubRemotePrLifecycleSummary,
  createGithubRemoteRefSummary,
  createRemoteSupersedeChainProjection,
  createRemoteSupersedePlan,
  createRemoteSupersedeRun,
  executeGithubBranchPublish,
  executeGithubDraftPrCreation,
  executeGithubMetadataObservation,
  executeGithubMerge,
  executeGithubPrLifecycleObservation,
  executeGithubPrManagement,
  executeGithubRemoteCleanup,
  readGithubTokenReadiness,
  runGithubBranchPublishAcceptanceRehearsal,
  runGithubDraftPrAcceptanceRehearsal,
  runGithubMergeAcceptanceRehearsal,
  runGithubPrLifecycleAcceptanceRehearsal,
  runGithubPrManagementAcceptanceRehearsal,
  runGithubRemoteCleanupAcceptanceRehearsal,
  runGithubPublishDraftPrAcceptanceRehearsal,
  runRemoteSupersedeAcceptanceRehearsal,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

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
const githubProviderSourceDir = dirname(fileURLToPath(import.meta.url));
const githubHttpBoundaryFileName = 'github-http-boundary.ts';
function expectNoForbiddenGithubPublicOutput(serialized: string): void {
  expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
}

function listGithubProviderSourceFiles(dir = githubProviderSourceDir): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return listGithubProviderSourceFiles(fullPath);
    }

    return fullPath.endsWith('.ts') && !fullPath.endsWith('.d.ts') && !fullPath.endsWith('.test.ts')
      ? [fullPath]
      : [];
  });
}

function sourceFileLabel(filePath: string): string {
  return relative(githubProviderSourceDir, filePath).split(sep).join('/');
}

function expectGithubCallSequence(
  calls: Array<{ url: string; method: string }>,
  expected: Array<{ method: string; suffix: string }>,
): void {
  expect(calls.map((call) => ({ method: call.method, suffix: new URL(call.url).pathname }))).toEqual(
    expected,
  );
  expect(calls.every((call) => call.url.startsWith('https://api.github.com/'))).toBe(true);
}

describe('GitHub HTTP boundary source guard', () => {
  it('keeps direct GitHub endpoint construction inside the reviewed boundary file', () => {
    const endpointConstructionTerms = [
      'api.github.com',
      'application/vnd.github+json',
      'x-github-api-version',
      '/actions/runs',
      '/actions/workflows/',
      '/git/ref/heads/',
      '/git/refs',
      '/issues/',
      '/milestones/',
      '/pulls/',
      '/requested_reviewers',
      '/releases',
    ];
    const violations = listGithubProviderSourceFiles()
      .filter((file) => sourceFileLabel(file) !== githubHttpBoundaryFileName)
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        const label = sourceFileLabel(file);
        return endpointConstructionTerms
          .filter((term) => source.includes(term))
          .filter((term) => !(label === 'index.ts' && term === 'api.github.com'))
          .map((term) => `${label} contains ${term}`);
      });

    expect(violations).toEqual([]);
  });

  it('keeps GitHub writes on the reviewed fixed helper callset', () => {
    const boundarySource = readFileSync(join(githubProviderSourceDir, githubHttpBoundaryFileName), 'utf8');
    const mutatingHelperCalls = [
      ...boundarySource.matchAll(
        /(?:=\s+await|return)\s+(fetchFixedGithub(?:Post|Patch|Put|Delete)[A-Za-z]*)\(/g,
      ),
    ].map((match) => match[1]);

    expect(mutatingHelperCalls).toEqual([
      'fetchFixedGithubPutJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPatchJson',
      'fetchFixedGithubDelete',
      'fetchFixedGithubPostDraftPullRequest',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPostJson',
      'fetchFixedGithubPatchJson',
      'fetchFixedGithubPostJson',
    ]);
  });

  it('continues to forbid arbitrary GitHub passthrough and release publish drift', () => {
    const boundarySource = readFileSync(join(githubProviderSourceDir, githubHttpBoundaryFileName), 'utf8');
    const forbiddenTerms = [
      '/graphql',
      '/deployments',
      '/contents/',
      '/releases/assets',
      '/collaborators',
      '/teams/',
      'auto_merge',
      'delete_branch_on_merge',
      'draft: false',
      'force: true',
      'make_latest',
      'publish_release',
    ];
    const violations = forbiddenTerms.filter((term) => boundarySource.includes(term));

    expect(violations).toEqual([]);
    expect(boundarySource).toContain('draft: true');
    expect(boundarySource).toContain('/pulls/${prNumber}/merge');
    expect(boundarySource).toContain('/actions/workflows/${workflowId}/dispatches');
    expect(boundarySource).toContain('/releases');
  });

  it('keeps PR management write endpoints fixed per family', async () => {
    const cases = [
      {
        kind: 'labels' as const,
        items: ['ready-for-review'],
        expected: [
          { method: 'GET', suffix: '/repos/octo-org/codexhub' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/issues/17/labels' },
          { method: 'POST', suffix: '/repos/octo-org/codexhub/issues/17/labels' },
        ],
      },
      {
        kind: 'assignees' as const,
        items: ['octocat'],
        expected: [
          { method: 'GET', suffix: '/repos/octo-org/codexhub' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
          { method: 'POST', suffix: '/repos/octo-org/codexhub/issues/17/assignees' },
        ],
      },
      {
        kind: 'reviewers' as const,
        items: ['reviewer-a'],
        expected: [
          { method: 'GET', suffix: '/repos/octo-org/codexhub' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
          { method: 'POST', suffix: '/repos/octo-org/codexhub/pulls/17/requested_reviewers' },
        ],
      },
      {
        kind: 'milestones' as const,
        items: ['42'],
        expected: [
          { method: 'GET', suffix: '/repos/octo-org/codexhub' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/milestones/42' },
          { method: 'PATCH', suffix: '/repos/octo-org/codexhub/issues/17' },
        ],
      },
      {
        kind: 'comments' as const,
        items: ['generated-comment-summary'],
        expected: [
          { method: 'GET', suffix: '/repos/octo-org/codexhub' },
          { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
          { method: 'POST', suffix: '/repos/octo-org/codexhub/issues/17/comments' },
        ],
      },
    ];

    for (const testCase of cases) {
      const calls: Array<{ url: string; method: string }> = [];
      const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(url), method: init?.method ?? 'GET' });
        return new Response(JSON.stringify({ ok: true }), { status: init?.method ? 201 : 200 });
      }) as typeof fetch;

      const result = await runGithubPrManagementHttpBoundary({
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/test',
        managementKind: testCase.kind,
        prNumber: '17',
        itemSummaries: testCase.items,
        payloadSummary: `${testCase.kind} generated payload summary`,
        token: 'ghp_secret',
        fetchImpl,
      });

      expect(result.status).toBe('completed');
      expectGithubCallSequence(calls, testCase.expected);
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('ghp_secret');
      expect(serialized).not.toContain(`${testCase.kind} generated payload summary`);
      if (testCase.kind !== 'milestones') {
        expect(serialized).not.toContain(testCase.items[0]);
      }
    }
  });

  it('keeps merge and GitHub Actions endpoints fixed with metadata-only results', async () => {
    const calls: Array<{ url: string; method: string; body?: string }> = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: typeof init?.body === 'string' ? init.body : undefined,
      });
      const path = new URL(String(url)).pathname;
      const body = path.endsWith('/pulls/17')
        ? { state: 'open', head: { sha: 'head-sha-123' } }
        : path.endsWith('/commits/head-sha-123/status')
          ? { statuses: [{ state: 'success' }] }
          : path.endsWith('/commits/head-sha-123/check-runs')
            ? { check_runs: [{ status: 'completed', conclusion: 'success' }] }
            : path.endsWith('/pulls/17/reviews')
              ? [{ state: 'APPROVED' }]
              : path.endsWith('/pulls/17/merge')
                ? { sha: 'merge-sha-123' }
                : path.endsWith('/actions/runs/123')
                  ? { id: 123, status: 'completed', conclusion: 'success', name: 'ci' }
                  : path.endsWith('/actions/runs/123/jobs')
                    ? { jobs: [{ id: 1, name: 'test', status: 'completed', conclusion: 'success' }] }
                    : path.endsWith('/actions/runs/123/logs')
                      ? 'raw transient log text'
                      : { ok: true };
      return new Response(JSON.stringify(body), { status: init?.method ? 201 : 200 });
    }) as typeof fetch;

    const merge = await runGithubMergeHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      prNumber: '17',
      expectedHeadSha: 'head-sha-123',
      mergeStrategy: 'squash',
      token: 'ghp_secret',
      fetchImpl,
    });
    const observation = await runGithubActionsObservationHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      workflowRunId: '123',
      logByteCap: 4096,
      token: 'ghp_secret',
      fetchImpl,
    });
    const rerun = await runGithubActionsRunControlHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      controlKind: 'rerun',
      workflowRunId: '123',
      token: 'ghp_secret',
      fetchImpl,
    });
    const cancel = await runGithubActionsRunControlHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      controlKind: 'cancel',
      workflowRunId: '123',
      token: 'ghp_secret',
      fetchImpl,
    });
    const dispatch = await runGithubActionsDispatchHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      workflowId: 'build.yml',
      ref: 'main',
      token: 'ghp_secret',
      fetchImpl,
    });

    expect([merge.status, observation.status, rerun.status, cancel.status, dispatch.status]).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
      'completed',
    ]);
    expectGithubCallSequence(calls, [
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/branches/main/protection' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/commits/head-sha-123/status' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/commits/head-sha-123/check-runs' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17/reviews' },
      { method: 'PUT', suffix: '/repos/octo-org/codexhub/pulls/17/merge' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs/123' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs/123/jobs' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs/123/logs' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs/123' },
      { method: 'POST', suffix: '/repos/octo-org/codexhub/actions/runs/123/rerun' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/runs/123' },
      { method: 'POST', suffix: '/repos/octo-org/codexhub/actions/runs/123/cancel' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/actions/workflows/build.yml' },
      { method: 'POST', suffix: '/repos/octo-org/codexhub/actions/workflows/build.yml/dispatches' },
    ]);
    const dispatchBody = calls.at(-1)?.body ?? '';
    expect(JSON.parse(dispatchBody)).toEqual({ ref: 'main' });
    const serialized = JSON.stringify([merge, observation, rerun, cancel, dispatch]);
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('raw transient log text');
  });

  it('keeps remote cleanup constrained to codexhub branch close and ref delete endpoints', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' });
      return new Response(JSON.stringify({ ok: true }), { status: init?.method ? 200 : 200 });
    }) as typeof fetch;

    const result = await runGithubRemoteCleanupHttpBoundary({
      owner: 'octo-org',
      repo: 'codexhub',
      oldBranchName: 'codexhub/old-pilot',
      oldPrNumber: '17',
      token: 'ghp_secret',
      fetchImpl,
    });

    expect(result.status).toBe('completed');
    expectGithubCallSequence(calls, [
      { method: 'GET', suffix: '/repos/octo-org/codexhub' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/pulls/17' },
      { method: 'GET', suffix: '/repos/octo-org/codexhub/git/ref/heads/codexhub%2Fold-pilot' },
      { method: 'PATCH', suffix: '/repos/octo-org/codexhub/pulls/17' },
      { method: 'DELETE', suffix: '/repos/octo-org/codexhub/git/refs/heads/codexhub%2Fold-pilot' },
    ]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('codexhub/old-pilot');
  });
});

describe('GitHub release lifecycle HTTP boundary', () => {
  it('uses only fixed tag and release draft endpoints with hash-only results', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    let tagRefLookupCount = 0;
    const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' });
      const path = String(url);
      if (path.includes('/releases/tags/v1.2.3')) {
        return new Response('{}', { status: 404 });
      }
      if (path.includes('/git/ref/tags/v1.2.3')) {
        tagRefLookupCount += 1;
        return tagRefLookupCount === 1
          ? new Response('{}', { status: 404 })
          : new Response(JSON.stringify({ object: { sha: 'tag-sha-123' } }), { status: 200 });
      }
      if (path.endsWith('/git/tags')) {
        return new Response(JSON.stringify({ sha: 'tag-sha-123' }), { status: 201 });
      }
      if (path.endsWith('/git/refs')) {
        return new Response(JSON.stringify({ ref: 'refs/tags/v1.2.3' }), { status: 201 });
      }
      if (path.endsWith('/releases')) {
        return new Response(JSON.stringify({ id: 123, draft: true }), { status: 201 });
      }
      if (path.includes('/git/ref/heads/main')) {
        return new Response(JSON.stringify({ object: { sha: 'base-sha-123' } }), { status: 200 });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    const tag = await runGithubReleaseTagHttpBoundary({
      owner: 'two2wolf1-eng',
      repo: 'CodexHub',
      baseBranch: 'main',
      tagName: 'v1.2.3',
      tagMessage: 'Release v1.2.3',
      token: 'token',
      fetchImpl,
    });
    const draft = await runGithubReleaseDraftHttpBoundary({
      owner: 'two2wolf1-eng',
      repo: 'CodexHub',
      tagName: 'v1.2.3',
      releaseName: 'Release v1.2.3',
      releaseBody: 'raw release body is sent transiently only',
      token: 'token',
      fetchImpl,
    });
    const serialized = JSON.stringify([tag, draft]);

    expect(tag.status).toBe('completed');
    expect(draft.status).toBe('completed');
    expect(calls.map((call) => call.method)).toEqual([
      'GET',
      'GET',
      'GET',
      'POST',
      'POST',
      'GET',
      'GET',
      'GET',
      'POST',
    ]);
    expect(calls.every((call) => call.url.startsWith('https://api.github.com/'))).toBe(true);
    expect(serialized).not.toContain('raw release body');
    expect(serialized).not.toContain('token');
  });
});

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

  it('keeps adversarial raw fixtures out of provider public summaries', () => {
    const tokenReadiness = readGithubTokenReadiness(
      { CODEXHUB_GITHUB_TOKEN: adversarialPublicOutputFixture },
      fixedNow,
    );
    const dryRun = createGithubMetadataDryRunRecord({
      owner: 'two2wolf1-eng',
      repo: 'CodexHub',
      baseBranch: adversarialPublicOutputFixture,
      headBranch: adversarialPublicOutputFixture,
      requestedMetadata: ['repo', 'base_branch', 'head_branch'],
      now: fixedNow,
    });

    expectNoForbiddenGithubPublicOutput(JSON.stringify({ tokenReadiness, dryRun }));
    expect(tokenReadiness.tokenHash).toMatch(/^sha256:/);
    expect(dryRun.targetRef.baseBranchHash).toMatch(/^sha256:/);
  });

  it('keeps GitHub provider public summaries metadata-only after JSON round-trip', () => {
    const tokenReadiness = readGithubTokenReadiness(
      { CODEXHUB_GITHUB_TOKEN: adversarialPublicOutputFixture },
      fixedNow,
    );
    const metadataPlan = createGithubMetadataDryRunRecord({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: adversarialPublicOutputFixture,
      headBranch: adversarialPublicOutputFixture,
      now: fixedNow,
    });
    const draftPrPlan = createGithubDraftPrPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m24-roundtrip',
      sourceKind: 'local_rc_readiness',
      sourceId: adversarialPublicOutputFixture,
      sourceSummary: adversarialPublicOutputFixture,
      titleSummary: adversarialPublicOutputFixture,
      bodySectionSummaries: [adversarialPublicOutputFixture],
      remoteHeadBranchExists: true,
      existingPullRequestCount: 0,
      now: fixedNow,
    });
    const supersedePlan = createRemoteSupersedePlan({
      sourceRunId: adversarialPublicOutputFixture,
      sourceSummary: adversarialPublicOutputFixture,
      targetKind: 'draft_pr_and_branch',
      oldBranchName: 'codexhub/m24-roundtrip',
      oldPrNumber: adversarialPublicOutputFixture,
      oldPrUrl: adversarialPublicOutputFixture,
      successorReady: true,
      metadataReady: true,
      now: fixedNow,
    });
    const supersedeRun = createRemoteSupersedeRun({ plan: supersedePlan, now: fixedNow });

    expect(
      findAdversarialPublicOutputRoundTripLeaks({
        tokenReadiness,
        metadataPlan,
        draftPrPlan,
        supersedePlan,
        supersedeRun,
      }),
    ).toEqual([]);
    expect(draftPrPlan.bodyStored).toBe(false);
    expect(supersedeRun.networkBoundaryInvoked).toBe(false);
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

  it('plans PR lifecycle observation as approval-gated fixed GET metadata', () => {
    const plan = createGithubPrLifecycleObservationPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m19',
      prNumber: '42',
      commitSha: 'abc123',
      runnerMode: 'controlled-github-pr-lifecycle',
      now: fixedNow,
    });
    const serialized = JSON.stringify(plan);

    expect(GithubPrLifecycleObservationPlanSchema.parse(plan).status).toBe('planned');
    expect(plan.requiresApproval).toBe(true);
    expect(plan.networkBoundaryPlanned).toBe(true);
    expect(plan.networkBoundaryInvoked).toBe(false);
    expect(plan.rawUrlStored).toBe(false);
    expect(plan.rawResponseBodyStored).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m19');
    expect(serialized).not.toContain('abc123');
  });

  it('runs PR lifecycle fixed GETs through the injected boundary and stores counts only', async () => {
    const dryRunRecord = createGithubPrLifecycleObservationPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codex/m19',
      prNumber: '42',
      commitSha: 'abc123',
      runnerMode: 'controlled-github-pr-lifecycle',
      now: fixedNow,
    });
    const approvalRecord = createGithubPrLifecycleApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const requestedUrls: string[] = [];
    const fetchImpl = (async (url: string) => {
      requestedUrls.push(url);
      const body = url.endsWith('/pulls/42')
        ? '{"number":42,"html_url":"https://github.com/octo-org/codexhub/pull/42","state":"open","head":{"sha":"abc123"}}'
        : url.endsWith('/status')
          ? '{"state":"success","statuses":[{"state":"success"},{"state":"failure"}]}'
          : url.endsWith('/check-runs')
            ? '{"total_count":3,"check_runs":[{"conclusion":"success","status":"completed"},{"conclusion":"failure","status":"completed"},{"conclusion":null,"status":"in_progress"}]}'
            : '{"ok":true}';

      return {
        ok: true,
        status: 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubPrLifecycleObservation({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m19',
        prNumber: '42',
        commitSha: 'abc123',
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.responseBodyHashes).toHaveLength(5);
    expect(run.lifecycleSummary.checkRunCount).toBe(3);
    expect(run.lifecycleSummary.statusContextCount).toBe(2);
    expect(run.lifecycleSummary.failedCheckCount).toBe(2);
    expect(run.lifecycleSummary.pendingCheckCount).toBe(1);
    expect(run.lifecycleSummary.passedCheckCount).toBe(2);
    expect(requestedUrls).toEqual([
      'https://api.github.com/repos/octo-org/codexhub',
      'https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codex%2Fm19',
      'https://api.github.com/repos/octo-org/codexhub/commits/abc123/status',
      'https://api.github.com/repos/octo-org/codexhub/commits/abc123/check-runs',
    ]);
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub');
    expect(serialized).not.toContain('codex/m19');
    expect(serialized).not.toContain('abc123');
    expect(serialized).not.toContain('html_url');
    expect(serialized).not.toContain('total_count');
    expect(serialized).not.toContain('in_progress');
  });

  it('keeps PR lifecycle rehearsal fixture-only', () => {
    const run = runGithubPrLifecycleAcceptanceRehearsal({
      scenario: 'checks-failed',
      now: fixedNow,
    });

    expect(run.status).toBe('failed');
    expect(run.lifecycleStatus).toBe('checks_failed');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(run.noRealWrite).toBe(true);
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

  it('projects remote supersede metadata without invoking GitHub boundaries', () => {
    const plan = createRemoteSupersedePlan({
      sourceRunId: 'rework_run_1',
      sourceSummary: 'Rework run one superseded by draft PR run two.',
      targetKind: 'draft_pr_and_branch',
      sourceBranchPublishRunId: 'branch_publish_run_1',
      sourceDraftPrRunId: 'draft_pr_run_1',
      sourcePrLifecycleRunId: 'pr_lifecycle_run_1',
      successorBranchPublishRunId: 'branch_publish_run_2',
      successorDraftPrRunId: 'draft_pr_run_2',
      oldBranchName: 'codexhub/m20-r1',
      oldPrNumber: '42',
      oldPrUrl: 'https://github.com/octo-org/codexhub/pull/42',
      successorReady: true,
      metadataReady: true,
      now: fixedNow,
    });
    const run = createRemoteSupersedeRun({ plan, now: fixedNow });
    const projection = createRemoteSupersedeChainProjection({ plan, runs: [run], now: fixedNow });
    const rehearsal = runRemoteSupersedeAcceptanceRehearsal({
      scenario: 'old-pr-open',
      now: fixedNow,
    });
    const serialized = JSON.stringify({ plan, run, projection, rehearsal });

    expect(RemoteSupersedePlanSchema.parse(plan).status).toBe('planned');
    expect(RemoteSupersedeRunSchema.parse(run).networkBoundaryInvoked).toBe(false);
    expect(projection.runCount).toBe(1);
    expect(projection.noRealWrite).toBe(true);
    expect(rehearsal.status).toBe('passed');
    expect(rehearsal.remoteWriteInvoked).toBe(false);
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m20-r1');
    expect(serialized).not.toContain('https://github.com');
    expect(serialized).not.toContain('ghp_');
  });

  it('blocks remote cleanup before boundary without authority, approval, or enabled config', async () => {
    const dryRunRecord = createGithubRemoteCleanupPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      oldBranchName: 'codexhub/m20-r1',
      oldPrNumber: '42',
      sourceBranchPublishRunId: 'branch_publish_run_1',
      sourceDraftPrRunId: 'draft_pr_run_1',
      successorRunId: 'draft_pr_run_2',
      successorReady: true,
      oldPrDraft: true,
      supersededByNewerDraftPr: true,
      runnerMode: 'controlled-github-remote-cleanup',
      now: fixedNow,
    });
    let fetchCalled = false;
    const run = await executeGithubRemoteCleanup({
      dryRunRecord,
      authority: { ...allowedAuthority, allowed: false },
      enabled: false,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        oldBranchName: 'codexhub/m20-r1',
        oldPrNumber: '42',
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(GithubRemoteCleanupPlanSchema.parse(dryRunRecord).status).toBe('planned');
    expect(GithubRemoteCleanupRunSchema.parse(run).status).toBe('blocked');
    expect(run.blockReasons).toEqual(
      expect.arrayContaining([
        'github_remote_cleanup_disabled',
        'missing_persisted_approval',
        'execution_authority_denied',
      ]),
    );
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('runs remote cleanup through the fixed GitHub cleanup sequence and stores hashes only', async () => {
    const dryRunRecord = createGithubRemoteCleanupPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      oldBranchName: 'codexhub/m20-r1',
      oldPrNumber: '42',
      sourceBranchPublishRunId: 'branch_publish_run_1',
      sourceDraftPrRunId: 'draft_pr_run_1',
      successorRunId: 'draft_pr_run_2',
      successorReady: true,
      oldPrDraft: true,
      supersededByNewerDraftPr: true,
      runnerMode: 'controlled-github-remote-cleanup',
      now: fixedNow,
    });
    const approvalRecord = createGithubRemoteCleanupApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const method = init?.method ?? 'GET';
      const body =
        method === 'GET' && url.endsWith('/pulls/42')
          ? '{"number":42,"draft":true,"state":"open"}'
          : method === 'GET' && url.includes('/git/ref/heads/codexhub%2Fm20-r1')
            ? '{"ref":"refs/heads/codexhub/m20-r1"}'
            : method === 'PATCH'
              ? '{"number":42,"state":"closed"}'
              : method === 'DELETE'
                ? ''
                : '{"ok":true}';

      return {
        ok: true,
        status: method === 'DELETE' ? 204 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubRemoteCleanup({
      dryRunRecord,
      approvalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        oldBranchName: 'codexhub/m20-r1',
        oldPrNumber: '42',
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(run.cleanupSummary.oldPrClosed).toBe(true);
    expect(run.cleanupSummary.oldBranchDeleted).toBe(true);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codexhub%2Fm20-r1',
      'PATCH https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'DELETE https://api.github.com/repos/octo-org/codexhub/git/refs/heads/codexhub%2Fm20-r1',
    ]);
    expect(requested.at(3)?.body).toBe('{"state":"closed"}');
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m20-r1');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('/merge');
    expect(serialized).not.toContain('/labels');
    expect(serialized).not.toContain('/comments');
    expect(serialized).not.toContain('requested_reviewers');
  });

  it('runs remote cleanup acceptance rehearsal as fixture-only metadata', () => {
    const passed = runGithubRemoteCleanupAcceptanceRehearsal({
      scenario: 'all-pass',
      now: fixedNow,
    });
    const blocked = runGithubRemoteCleanupAcceptanceRehearsal({
      scenario: 'branch-not-codexhub',
      now: fixedNow,
    });
    const failed = runGithubRemoteCleanupAcceptanceRehearsal({
      scenario: 'delete-ref-failed',
      now: fixedNow,
    });
    const serialized = JSON.stringify({ passed, blocked, failed });

    expect(passed.status).toBe('passed');
    expect(blocked.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.closePrAllowed).toBe(true);
    expect(passed.deleteRefAllowed).toBe(true);
    expect(passed.deleteNonCodexhubBranchAllowed).toBe(false);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.commentAllowed).toBe(false);
    expect(passed.labelAllowed).toBe(false);
    expect(passed.reviewerAllowed).toBe(false);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.processBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m20-r1');
    expect(serialized).not.toContain('https://api.github.com');
  });
});

describe('github-provider-adapter M37 PR management', () => {
  it('plans and executes label management through fixed approval-gated endpoints', async () => {
    const dryRunRecord = createGithubPrManagementPlan({
      managementKind: 'labels',
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m37',
      prNumber: '42',
      itemSummaries: ['bug', 'm37'],
      payloadSummary: 'Apply approved labels from metadata summary.',
      runnerMode: 'controlled-github-pr-management',
      now: fixedNow,
    });
    const approvalRecord = createGithubPrManagementApprovalRecord({
      dryRunRecord,
      status: 'approved',
      now: fixedNow,
    });
    const authority = {
      ...allowedAuthority,
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: approvalRecord.approvalArtifactId,
    };
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const method = init?.method ?? 'GET';
      const body = method === 'POST' ? '{"labels":["bug","m37"]}' : '{"ok":true}';

      return {
        ok: true,
        status: method === 'POST' ? 201 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubPrManagement({
      dryRunRecord,
      approvalRecord,
      authority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m37',
        managementKind: 'labels',
        prNumber: '42',
        itemSummaries: ['bug', 'm37'],
        payloadSummary: 'Apply approved labels from metadata summary.',
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify({ dryRunRecord, run });

    expect(GithubPrManagementPlanSchema.parse(dryRunRecord).status).toBe('planned');
    expect(GithubPrManagementRunSchema.parse(run).status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.managementSummary.changed).toBe(true);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'GET https://api.github.com/repos/octo-org/codexhub/issues/42/labels',
      'POST https://api.github.com/repos/octo-org/codexhub/issues/42/labels',
    ]);
    expect(requested.at(3)?.body).toBe('{"labels":["bug","m37"]}');
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m37');
    expect(serialized).not.toContain('"bug"');
    expect(serialized).not.toContain('https://api.github.com');
  });

  it('runs PR management rehearsals without invoking network boundaries', () => {
    const passed = runGithubPrManagementAcceptanceRehearsal({
      managementKind: 'comments',
      scenario: 'all-pass',
      now: fixedNow,
    });
    const blocked = runGithubPrManagementAcceptanceRehearsal({
      managementKind: 'comments',
      scenario: 'approval-blocked',
      now: fixedNow,
    });
    const failed = runGithubPrManagementAcceptanceRehearsal({
      managementKind: 'comments',
      scenario: 'github-write-failed',
      now: fixedNow,
    });

    expect(passed.status).toBe('passed');
    expect(blocked.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.noRealWrite).toBe(true);
    expect(passed.fixedEndpointOnly).toBe(true);
    expect(passed.addOrSetOnly).toBe(true);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(JSON.stringify({ passed, blocked, failed })).not.toContain('ghp_');
  });
});

describe('github-provider-adapter M38 governed merge', () => {
  it('executes merge only after readiness and merge approvals through fixed endpoints', async () => {
    const dryRunRecord = createGithubMergeReadinessPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m38',
      prNumber: '42',
      expectedHeadSha: 'abc123',
      mergeStrategy: 'squash',
      prOpen: true,
      branchProtectionSatisfied: true,
      checksPassed: true,
      reviewsSatisfied: true,
      checkRunCount: 1,
      statusContextCount: 1,
      passedCheckCount: 2,
      reviewDecisionCount: 1,
      approvingReviewCount: 1,
      runnerMode: 'controlled-github-merge',
      now: fixedNow,
    });
    const readinessApprovalRecord = createGithubMergeApprovalRecord({
      dryRunRecord,
      approvalPhase: 'readiness',
      status: 'approved',
      decidedBy: 'alice',
      now: fixedNow,
    });
    const mergeApprovalRecord = createGithubMergeApprovalRecord({
      dryRunRecord,
      approvalPhase: 'merge_execution',
      status: 'approved',
      decidedBy: 'bob',
      now: fixedNow,
    });
    const authority = {
      ...allowedAuthority,
      policyDecisionId: dryRunRecord.policyDecision.id,
      approvalArtifactId: mergeApprovalRecord.approvalArtifactId,
    };
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const method = init?.method ?? 'GET';
      const body = url.endsWith('/pulls/42')
        ? '{"number":42,"state":"open","head":{"sha":"abc123"}}'
        : url.endsWith('/branches/main/protection')
          ? '{"required_status_checks":{}}'
          : url.endsWith('/commits/abc123/status')
            ? '{"statuses":[{"state":"success"}]}'
            : url.endsWith('/commits/abc123/check-runs')
              ? '{"check_runs":[{"status":"completed","conclusion":"success"}]}'
              : url.endsWith('/pulls/42/reviews')
                ? '[{"state":"APPROVED"}]'
                : method === 'PUT'
                  ? '{"sha":"merge123","merged":true}'
                  : '{"ok":true}';

      return {
        ok: true,
        status: method === 'PUT' ? 200 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;

    const run = await executeGithubMerge({
      dryRunRecord,
      readinessApprovalRecord,
      mergeApprovalRecord,
      authority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m38',
        prNumber: '42',
        expectedHeadSha: 'abc123',
        mergeStrategy: 'squash',
        token: 'ghp_secret',
      },
      fetchImpl,
      now: fixedNow,
    });
    const serialized = JSON.stringify({ dryRunRecord, run });

    expect(GithubMergeReadinessPlanSchema.parse(dryRunRecord).status).toBe('planned');
    expect(GithubMergeRunSchema.parse(run).status).toBe('completed');
    expect(run.networkBoundaryInvoked).toBe(true);
    expect(run.noRealWrite).toBe(false);
    expect(run.resultSummary.merged).toBe(true);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'GET https://api.github.com/repos/octo-org/codexhub/branches/main/protection',
      'GET https://api.github.com/repos/octo-org/codexhub/commits/abc123/status',
      'GET https://api.github.com/repos/octo-org/codexhub/commits/abc123/check-runs',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42/reviews',
      'PUT https://api.github.com/repos/octo-org/codexhub/pulls/42/merge',
    ]);
    expect(requested.at(6)?.body).toBe('{"merge_method":"squash"}');
    expect(serialized).not.toContain('ghp_secret');
    expect(serialized).not.toContain('octo-org');
    expect(serialized).not.toContain('codexhub/m38');
    expect(serialized).not.toContain('abc123');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('APPROVED');
  });

  it('blocks merge when both approvals come from the same approver before network', async () => {
    const dryRunRecord = createGithubMergeReadinessPlan({
      owner: 'octo-org',
      repo: 'codexhub',
      baseBranch: 'main',
      headBranch: 'codexhub/m38',
      prNumber: '42',
      expectedHeadSha: 'abc123',
      mergeStrategy: 'merge',
      runnerMode: 'controlled-github-merge',
      now: fixedNow,
    });
    const readinessApprovalRecord = createGithubMergeApprovalRecord({
      dryRunRecord,
      approvalPhase: 'readiness',
      status: 'approved',
      decidedBy: 'alice',
      now: fixedNow,
    });
    const mergeApprovalRecord = createGithubMergeApprovalRecord({
      dryRunRecord,
      approvalPhase: 'merge_execution',
      status: 'approved',
      decidedBy: 'alice',
      now: fixedNow,
    });
    let fetchCalled = false;

    const run = await executeGithubMerge({
      dryRunRecord,
      readinessApprovalRecord,
      mergeApprovalRecord,
      authority: allowedAuthority,
      enabled: true,
      runtime: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m38',
        prNumber: '42',
        expectedHeadSha: 'abc123',
        mergeStrategy: 'merge',
        token: 'ghp_secret',
      },
      fetchImpl: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
      now: fixedNow,
    });

    expect(run.status).toBe('blocked');
    expect(run.blockReasons).toContain('second_approver_required');
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(fetchCalled).toBe(false);
  });

  it('runs merge acceptance rehearsal without invoking network boundaries', () => {
    const passed = runGithubMergeAcceptanceRehearsal({ scenario: 'all-pass', now: fixedNow });
    const blocked = runGithubMergeAcceptanceRehearsal({
      scenario: 'reviews-missing',
      now: fixedNow,
    });
    const failed = runGithubMergeAcceptanceRehearsal({
      scenario: 'github-merge-failed',
      now: fixedNow,
    });

    expect(passed.status).toBe('passed');
    expect(blocked.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.requiresTwoApprovals).toBe(true);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.noRealWrite).toBe(true);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(JSON.stringify({ passed, blocked, failed })).not.toContain('ghp_');
  });
});

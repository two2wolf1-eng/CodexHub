import { hashText } from '@codexhub/evidence-kernel';

export interface GithubHttpBoundaryRequest {
  owner: string;
  repo: string;
  baseBranch?: string;
  headBranch?: string;
  token: string;
  fetchImpl?: typeof fetch;
}

export interface GithubHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  repoMetadataHash?: string;
  baseBranchMetadataHash?: string;
  headBranchMetadataHash?: string;
  existingPullRequestCount: number;
  blockReasons: string[];
  summary: string;
}

export interface GithubDraftPrHttpBoundaryRequest extends GithubHttpBoundaryRequest {
  baseBranch: string;
  headBranch: string;
  title: string;
  body: string;
}

export interface GithubDraftPrHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  existingPullRequestCount: number;
  prNumberHash?: string;
  prUrlHash?: string;
  created: boolean;
  blockReasons: string[];
  summary: string;
}

export interface GithubBranchPublishBoundaryFile {
  relativePath: string;
  content: string;
}

export interface GithubBranchPublishHttpBoundaryRequest extends GithubHttpBoundaryRequest {
  baseBranch: string;
  branchName: string;
  commitMessage: string;
  files: GithubBranchPublishBoundaryFile[];
}

export interface GithubBranchPublishHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  commitShaHash?: string;
  treeShaHash?: string;
  branchNameHash?: string;
  created: boolean;
  blockReasons: string[];
  summary: string;
}

interface GithubBoundaryResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

const GITHUB_API_HOST = 'api.github.com';

export async function runGithubMetadataHttpBoundary(
  request: GithubHttpBoundaryRequest,
): Promise<GithubHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedBoundaryResult(false, ['fetch_unavailable']);
  }

  const responseBodyHashes: string[] = [];
  const blockReasons: string[] = [];

  try {
    const repo = await fetchFixedGithubGet(fetchImpl, request, `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}`);
    responseBodyHashes.push(repo.bodyHash);
    if (!repo.ok) {
      blockReasons.push(`repo_metadata_http_${repo.status}`);
    }

    let baseBranchMetadataHash: string | undefined;
    if (request.baseBranch) {
      const baseBranch = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/branches/${encodePathSegment(request.baseBranch)}`,
      );
      responseBodyHashes.push(baseBranch.bodyHash);
      baseBranchMetadataHash = baseBranch.bodyHash;
      if (!baseBranch.ok) {
        blockReasons.push(`base_branch_http_${baseBranch.status}`);
      }
    }

    let headBranchMetadataHash: string | undefined;
    if (request.headBranch) {
      const headBranch = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/branches/${encodePathSegment(request.headBranch)}`,
      );
      responseBodyHashes.push(headBranch.bodyHash);
      headBranchMetadataHash = headBranch.bodyHash;
      if (!headBranch.ok) {
        blockReasons.push(`head_branch_http_${headBranch.status}`);
      }
    }

    let existingPullRequestCount = 0;
    if (request.baseBranch && request.headBranch) {
      const pulls = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls?state=open&base=${encodeQueryValue(request.baseBranch)}&head=${encodeQueryValue(`${request.owner}:${request.headBranch}`)}`,
      );
      responseBodyHashes.push(pulls.bodyHash);
      if (!pulls.ok) {
        blockReasons.push(`pull_request_lookup_http_${pulls.status}`);
      } else {
        existingPullRequestCount = countArrayItems(pulls.bodyText);
      }
    }

    return {
      status: blockReasons.length === 0 ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      repoMetadataHash: repo.bodyHash,
      baseBranchMetadataHash,
      headBranchMetadataHash,
      existingPullRequestCount,
      blockReasons,
      summary:
        blockReasons.length === 0
          ? 'GitHub metadata HTTP boundary completed with hash-only response summaries.'
          : `GitHub metadata HTTP boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedBoundaryResult(true, ['github_metadata_network_failure']),
      responseBodyHashes,
    };
  }
}

export async function runGithubDraftPrHttpBoundary(
  request: GithubDraftPrHttpBoundaryRequest,
): Promise<GithubDraftPrHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedDraftPrBoundaryResult(false, ['fetch_unavailable']);
  }

  const responseBodyHashes: string[] = [];
  const blockReasons: string[] = [];

  try {
    const repo = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}`,
    );
    responseBodyHashes.push(repo.bodyHash);
    if (!repo.ok) {
      blockReasons.push(`repo_metadata_http_${repo.status}`);
    }

    const baseBranch = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/branches/${encodePathSegment(request.baseBranch)}`,
    );
    responseBodyHashes.push(baseBranch.bodyHash);
    if (!baseBranch.ok) {
      blockReasons.push(`base_branch_http_${baseBranch.status}`);
    }

    const headBranch = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/branches/${encodePathSegment(request.headBranch)}`,
    );
    responseBodyHashes.push(headBranch.bodyHash);
    if (!headBranch.ok) {
      blockReasons.push(`head_branch_http_${headBranch.status}`);
    }

    const pulls = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls?state=open&base=${encodeQueryValue(request.baseBranch)}&head=${encodeQueryValue(`${request.owner}:${request.headBranch}`)}`,
    );
    responseBodyHashes.push(pulls.bodyHash);
    const existingPullRequestCount = pulls.ok ? countArrayItems(pulls.bodyText) : 0;
    if (!pulls.ok) {
      blockReasons.push(`pull_request_lookup_http_${pulls.status}`);
    }
    if (existingPullRequestCount > 0) {
      blockReasons.push('existing_pull_request_found');
    }

    if (blockReasons.length > 0) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        existingPullRequestCount,
        created: false,
        blockReasons,
        summary: `GitHub draft PR preflight failed: ${blockReasons.join(', ')}.`,
      };
    }

    const createdPullRequest = await fetchFixedGithubPostDraftPullRequest(fetchImpl, request);
    responseBodyHashes.push(createdPullRequest.bodyHash);
    if (!createdPullRequest.ok) {
      blockReasons.push(`draft_pr_create_http_${createdPullRequest.status}`);
    }
    const created = createdPullRequest.ok;
    const createdMetadata = created ? extractCreatedPullRequestMetadata(createdPullRequest.bodyText) : {};

    return {
      status: created ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      existingPullRequestCount,
      prNumberHash: createdMetadata.prNumberHash,
      prUrlHash: createdMetadata.prUrlHash,
      created,
      blockReasons,
      summary: created
        ? 'GitHub draft PR HTTP boundary completed with hash-only response summaries.'
        : `GitHub draft PR HTTP boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedDraftPrBoundaryResult(true, ['github_draft_pr_network_failure']),
      responseBodyHashes,
    };
  }
}

export async function runGithubBranchPublishHttpBoundary(
  request: GithubBranchPublishHttpBoundaryRequest,
): Promise<GithubBranchPublishHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedBranchPublishBoundaryResult(false, ['fetch_unavailable']);
  }

  const responseBodyHashes: string[] = [];
  const blockReasons: string[] = [];

  try {
    const repo = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}`,
    );
    responseBodyHashes.push(repo.bodyHash);
    if (!repo.ok) {
      blockReasons.push(`repo_metadata_http_${repo.status}`);
    }

    const baseRef = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/ref/heads/${encodePathSegment(request.baseBranch)}`,
    );
    responseBodyHashes.push(baseRef.bodyHash);
    if (!baseRef.ok) {
      blockReasons.push(`base_ref_http_${baseRef.status}`);
    }
    const baseCommitSha = extractObjectSha(baseRef.bodyText);
    if (baseRef.ok && !baseCommitSha) {
      blockReasons.push('base_ref_sha_missing');
    }

    const existingBranch = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/ref/heads/${encodePathSegment(request.branchName)}`,
    );
    responseBodyHashes.push(existingBranch.bodyHash);
    if (existingBranch.ok) {
      blockReasons.push('remote_branch_exists');
    } else if (existingBranch.status !== 404) {
      blockReasons.push(`branch_exists_lookup_http_${existingBranch.status}`);
    }

    let baseTreeSha: string | undefined;
    if (baseCommitSha) {
      const baseCommit = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/commits/${encodePathSegment(baseCommitSha)}`,
      );
      responseBodyHashes.push(baseCommit.bodyHash);
      if (!baseCommit.ok) {
        blockReasons.push(`base_commit_http_${baseCommit.status}`);
      }
      baseTreeSha = extractTreeSha(baseCommit.bodyText);
      if (baseCommit.ok && !baseTreeSha) {
        blockReasons.push('base_tree_sha_missing');
      }
    }

    if (blockReasons.length > 0 || !baseCommitSha || !baseTreeSha) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        branchNameHash: `sha256:${hashText(request.branchName)}`,
        created: false,
        blockReasons,
        summary: `GitHub branch publish preflight failed: ${blockReasons.join(', ')}.`,
      };
    }

    const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [];
    for (const file of request.files) {
      const blob = await fetchFixedGithubPostJson(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/blobs`,
        {
          content: file.content,
          encoding: 'utf-8',
        },
      );
      responseBodyHashes.push(blob.bodyHash);
      if (!blob.ok) {
        blockReasons.push(`blob_create_http_${blob.status}`);
        continue;
      }
      const blobSha = extractSha(blob.bodyText);
      if (!blobSha) {
        blockReasons.push('blob_sha_missing');
        continue;
      }
      treeEntries.push({
        path: file.relativePath,
        mode: '100644',
        type: 'blob',
        sha: blobSha,
      });
    }

    if (blockReasons.length > 0) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        branchNameHash: `sha256:${hashText(request.branchName)}`,
        created: false,
        blockReasons,
        summary: `GitHub branch publish blob creation failed: ${blockReasons.join(', ')}.`,
      };
    }

    const tree = await fetchFixedGithubPostJson(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeEntries,
      },
    );
    responseBodyHashes.push(tree.bodyHash);
    if (!tree.ok) {
      blockReasons.push(`tree_create_http_${tree.status}`);
    }
    const treeSha = extractSha(tree.bodyText);
    if (tree.ok && !treeSha) {
      blockReasons.push('tree_sha_missing');
    }

    if (blockReasons.length > 0 || !treeSha) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        branchNameHash: `sha256:${hashText(request.branchName)}`,
        treeShaHash: treeSha ? `sha256:${hashText(treeSha)}` : undefined,
        created: false,
        blockReasons,
        summary: `GitHub branch publish tree creation failed: ${blockReasons.join(', ')}.`,
      };
    }

    const commit = await fetchFixedGithubPostJson(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/commits`,
      {
        message: request.commitMessage,
        tree: treeSha,
        parents: [baseCommitSha],
      },
    );
    responseBodyHashes.push(commit.bodyHash);
    if (!commit.ok) {
      blockReasons.push(`commit_create_http_${commit.status}`);
    }
    const commitSha = extractSha(commit.bodyText);
    if (commit.ok && !commitSha) {
      blockReasons.push('commit_sha_missing');
    }

    if (blockReasons.length > 0 || !commitSha) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        branchNameHash: `sha256:${hashText(request.branchName)}`,
        treeShaHash: `sha256:${hashText(treeSha)}`,
        created: false,
        blockReasons,
        summary: `GitHub branch publish commit creation failed: ${blockReasons.join(', ')}.`,
      };
    }

    const ref = await fetchFixedGithubPostJson(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/refs`,
      {
        ref: `refs/heads/${request.branchName}`,
        sha: commitSha,
      },
    );
    responseBodyHashes.push(ref.bodyHash);
    if (!ref.ok) {
      blockReasons.push(`ref_create_http_${ref.status}`);
    }

    return {
      status: ref.ok ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      commitShaHash: `sha256:${hashText(commitSha)}`,
      treeShaHash: `sha256:${hashText(treeSha)}`,
      branchNameHash: `sha256:${hashText(request.branchName)}`,
      created: ref.ok,
      blockReasons,
      summary: ref.ok
        ? 'GitHub branch publish HTTP boundary completed with hash-only response summaries.'
        : `GitHub branch publish HTTP boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedBranchPublishBoundaryResult(true, ['github_branch_publish_network_failure']),
      responseBodyHashes,
    };
  }
}

async function fetchFixedGithubGet(
  fetchImpl: typeof fetch,
  request: GithubHttpBoundaryRequest,
  pathAndQuery: string,
): Promise<{
  ok: boolean;
  status: number;
  bodyHash: string;
  bodyText: string;
}> {
  const response = (await fetchImpl(`https://${GITHUB_API_HOST}${pathAndQuery}`, {
    method: 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${request.token}`,
      'x-github-api-version': '2022-11-28',
    },
  })) as GithubBoundaryResponse;
  const bodyText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    bodyHash: `sha256:${hashText(bodyText)}`,
    bodyText,
  };
}

async function fetchFixedGithubPostJson(
  fetchImpl: typeof fetch,
  request: GithubHttpBoundaryRequest,
  pathAndQuery: string,
  body: Record<string, unknown>,
): Promise<{
  ok: boolean;
  status: number;
  bodyHash: string;
  bodyText: string;
}> {
  const response = (await fetchImpl(`https://${GITHUB_API_HOST}${pathAndQuery}`, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${request.token}`,
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28',
    },
    body: JSON.stringify(body),
  })) as GithubBoundaryResponse;
  const bodyText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    bodyHash: `sha256:${hashText(bodyText)}`,
    bodyText,
  };
}

async function fetchFixedGithubPostDraftPullRequest(
  fetchImpl: typeof fetch,
  request: GithubDraftPrHttpBoundaryRequest,
): Promise<{
  ok: boolean;
  status: number;
  bodyHash: string;
  bodyText: string;
}> {
  const response = (await fetchImpl(
    `https://${GITHUB_API_HOST}/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls`,
    {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${request.token}`,
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({
        title: request.title,
        body: request.body,
        base: request.baseBranch,
        head: request.headBranch,
        draft: true,
      }),
    },
  )) as GithubBoundaryResponse;
  const bodyText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    bodyHash: `sha256:${hashText(bodyText)}`,
    bodyText,
  };
}

function createFailedBoundaryResult(
  networkBoundaryInvoked: boolean,
  blockReasons: string[],
): GithubHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    existingPullRequestCount: 0,
    blockReasons,
    summary: `GitHub metadata HTTP boundary failed: ${blockReasons.join(', ')}.`,
  };
}

function createFailedDraftPrBoundaryResult(
  networkBoundaryInvoked: boolean,
  blockReasons: string[],
): GithubDraftPrHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    existingPullRequestCount: 0,
    created: false,
    blockReasons,
    summary: `GitHub draft PR HTTP boundary failed: ${blockReasons.join(', ')}.`,
  };
}

function createFailedBranchPublishBoundaryResult(
  networkBoundaryInvoked: boolean,
  blockReasons: string[],
): GithubBranchPublishHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    created: false,
    blockReasons,
    summary: `GitHub branch publish HTTP boundary failed: ${blockReasons.join(', ')}.`,
  };
}

function countArrayItems(bodyText: string): number {
  try {
    const parsed = JSON.parse(bodyText) as unknown;

    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function extractObjectSha(bodyText: string): string | undefined {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const object = parsed.object;

    if (!object || typeof object !== 'object') {
      return undefined;
    }

    const sha = (object as Record<string, unknown>).sha;

    return typeof sha === 'string' ? sha : undefined;
  } catch {
    return undefined;
  }
}

function extractTreeSha(bodyText: string): string | undefined {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const tree = parsed.tree;

    if (!tree || typeof tree !== 'object') {
      return undefined;
    }

    const sha = (tree as Record<string, unknown>).sha;

    return typeof sha === 'string' ? sha : undefined;
  } catch {
    return undefined;
  }
}

function extractSha(bodyText: string): string | undefined {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const sha = parsed.sha;

    return typeof sha === 'string' ? sha : undefined;
  } catch {
    return undefined;
  }
}

function extractCreatedPullRequestMetadata(bodyText: string): {
  prNumberHash?: string;
  prUrlHash?: string;
} {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const prNumberHash =
      typeof parsed.number === 'number' ? `sha256:${hashText(String(parsed.number))}` : undefined;
    const prUrlHash =
      typeof parsed.html_url === 'string' ? `sha256:${hashText(parsed.html_url)}` : undefined;

    return { prNumberHash, prUrlHash };
  } catch {
    return {};
  }
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string): string {
  return encodeURIComponent(value);
}

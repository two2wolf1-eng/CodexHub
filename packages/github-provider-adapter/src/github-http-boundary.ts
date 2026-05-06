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

export interface GithubPrLifecycleHttpBoundaryRequest extends GithubHttpBoundaryRequest {
  baseBranch: string;
  headBranch: string;
  prNumber?: string;
  commitSha?: string;
}

export type GithubPrManagementBoundaryKind =
  | 'labels'
  | 'assignees'
  | 'reviewers'
  | 'milestones'
  | 'comments';

export interface GithubPrManagementHttpBoundaryRequest extends GithubHttpBoundaryRequest {
  baseBranch: string;
  headBranch: string;
  managementKind: GithubPrManagementBoundaryKind;
  prNumber: string;
  itemSummaries: string[];
  payloadSummary?: string;
}

export interface GithubPrManagementHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  prNumberHash?: string;
  payloadHash?: string;
  itemCount: number;
  changed: boolean;
  blockReasons: string[];
  summary: string;
}

export interface GithubPrLifecycleHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  prNumberHash?: string;
  prUrlHash?: string;
  stateSummary?: string;
  checkRunCount: number;
  statusContextCount: number;
  failedCheckCount: number;
  pendingCheckCount: number;
  passedCheckCount: number;
  blockReasons: string[];
  summary: string;
}

export interface GithubRemoteCleanupHttpBoundaryRequest extends GithubHttpBoundaryRequest {
  baseBranch?: string;
  oldBranchName: string;
  oldPrNumber?: string;
}

export interface GithubRemoteCleanupHttpBoundaryResult {
  status: 'completed' | 'failed' | 'aborted';
  networkBoundaryInvoked: boolean;
  responseBodyHashes: string[];
  oldPrNumberHash?: string;
  oldBranchNameHash: string;
  oldPrClosed: boolean;
  oldBranchDeleted: boolean;
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

export async function runGithubPrLifecycleHttpBoundary(
  request: GithubPrLifecycleHttpBoundaryRequest,
): Promise<GithubPrLifecycleHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedPrLifecycleBoundaryResult(false, ['fetch_unavailable']);
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

    const pulls = await fetchFixedGithubGet(
      fetchImpl,
      request,
      request.prNumber
        ? `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls/${encodePathSegment(request.prNumber)}`
        : `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls?state=open&base=${encodeQueryValue(request.baseBranch)}&head=${encodeQueryValue(`${request.owner}:${request.headBranch}`)}`,
    );
    responseBodyHashes.push(pulls.bodyHash);
    if (!pulls.ok) {
      blockReasons.push(`pull_request_metadata_http_${pulls.status}`);
    }

    const prMetadata = pulls.ok
      ? extractPullRequestLifecycleMetadata(pulls.bodyText, request.prNumber)
      : {};
    const prNumberHash =
      prMetadata.prNumberHash ??
      (request.prNumber ? `sha256:${hashText(request.prNumber)}` : undefined);
    const commitSha = request.commitSha ?? prMetadata.headCommitSha;
    if (!commitSha) {
      blockReasons.push('missing_commit_sha');
    }

    const headRef = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/ref/heads/${encodePathSegment(request.headBranch)}`,
    );
    responseBodyHashes.push(headRef.bodyHash);
    if (!headRef.ok) {
      blockReasons.push(`head_ref_http_${headRef.status}`);
    }

    let statusContextCount = 0;
    let checkRunCount = 0;
    let failedCheckCount = 0;
    let pendingCheckCount = 0;
    let passedCheckCount = 0;
    if (commitSha) {
      const combinedStatus = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/commits/${encodePathSegment(commitSha)}/status`,
      );
      responseBodyHashes.push(combinedStatus.bodyHash);
      if (!combinedStatus.ok) {
        blockReasons.push(`combined_status_http_${combinedStatus.status}`);
      } else {
        const counts = countCombinedStatusContexts(combinedStatus.bodyText);
        statusContextCount = counts.total;
        failedCheckCount += counts.failed;
        pendingCheckCount += counts.pending;
        passedCheckCount += counts.passed;
      }

      const checkRuns = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/commits/${encodePathSegment(commitSha)}/check-runs`,
      );
      responseBodyHashes.push(checkRuns.bodyHash);
      if (!checkRuns.ok) {
        blockReasons.push(`check_runs_http_${checkRuns.status}`);
      } else {
        const counts = countCheckRuns(checkRuns.bodyText);
        checkRunCount = counts.total;
        failedCheckCount += counts.failed;
        pendingCheckCount += counts.pending;
        passedCheckCount += counts.passed;
      }
    }

    return {
      status: blockReasons.length === 0 ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      prNumberHash,
      prUrlHash: prMetadata.prUrlHash,
      stateSummary: prMetadata.stateSummary,
      checkRunCount,
      statusContextCount,
      failedCheckCount,
      pendingCheckCount,
      passedCheckCount,
      blockReasons,
      summary:
        blockReasons.length === 0
          ? 'GitHub PR lifecycle GET boundary completed with hash-only status/check summaries.'
          : `GitHub PR lifecycle GET boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedPrLifecycleBoundaryResult(true, ['network_error']),
      responseBodyHashes,
    };
  }
}

export async function runGithubPrManagementHttpBoundary(
  request: GithubPrManagementHttpBoundaryRequest,
): Promise<GithubPrManagementHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedPrManagementBoundaryResult(false, request, ['fetch_unavailable']);
  }

  const responseBodyHashes: string[] = [];
  const blockReasons: string[] = [];
  const owner = encodePathSegment(request.owner);
  const repo = encodePathSegment(request.repo);
  const prNumber = encodePathSegment(request.prNumber);
  const payloadHash = `sha256:${hashText(
    JSON.stringify({
      managementKind: request.managementKind,
      itemSummaries: request.itemSummaries,
      payloadSummary: request.payloadSummary ?? '',
    }),
  )}`;

  try {
    const repoMetadata = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${owner}/${repo}`,
    );
    responseBodyHashes.push(repoMetadata.bodyHash);
    if (!repoMetadata.ok) {
      blockReasons.push(`repo_metadata_http_${repoMetadata.status}`);
    }

    const pullRequest = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${owner}/${repo}/pulls/${prNumber}`,
    );
    responseBodyHashes.push(pullRequest.bodyHash);
    if (!pullRequest.ok) {
      blockReasons.push(`pull_request_metadata_http_${pullRequest.status}`);
    }

    if (request.managementKind === 'labels') {
      const labels = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/issues/${prNumber}/labels`,
      );
      responseBodyHashes.push(labels.bodyHash);
      if (!labels.ok) {
        blockReasons.push(`issue_labels_http_${labels.status}`);
      }
    }

    if (request.managementKind === 'milestones') {
      const milestone = request.itemSummaries[0];
      if (!milestone) {
        blockReasons.push('milestone_number_missing');
      } else {
        const milestoneMetadata = await fetchFixedGithubGet(
          fetchImpl,
          request,
          `/repos/${owner}/${repo}/milestones/${encodePathSegment(milestone)}`,
        );
        responseBodyHashes.push(milestoneMetadata.bodyHash);
        if (!milestoneMetadata.ok) {
          blockReasons.push(`milestone_metadata_http_${milestoneMetadata.status}`);
        }
      }
    }

    if (blockReasons.length > 0) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        prNumberHash: `sha256:${hashText(request.prNumber)}`,
        payloadHash,
        itemCount: request.itemSummaries.length,
        changed: false,
        blockReasons,
        summary: `GitHub PR ${request.managementKind} preflight failed: ${blockReasons.join(', ')}.`,
      };
    }

    const writeResponse = await executeFixedGithubPrManagementWrite(fetchImpl, request);
    responseBodyHashes.push(writeResponse.bodyHash);
    if (!writeResponse.ok) {
      blockReasons.push(`pr_${request.managementKind}_write_http_${writeResponse.status}`);
    }

    return {
      status: writeResponse.ok ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      prNumberHash: `sha256:${hashText(request.prNumber)}`,
      payloadHash,
      itemCount: request.itemSummaries.length,
      changed: writeResponse.ok,
      blockReasons,
      summary: writeResponse.ok
        ? `GitHub PR ${request.managementKind} fixed endpoint boundary completed with hash-only summaries.`
        : `GitHub PR ${request.managementKind} fixed endpoint boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedPrManagementBoundaryResult(true, request, [
        `github_pr_${request.managementKind}_network_failure`,
      ]),
      responseBodyHashes,
    };
  }
}

export async function runGithubRemoteCleanupHttpBoundary(
  request: GithubRemoteCleanupHttpBoundaryRequest,
): Promise<GithubRemoteCleanupHttpBoundaryResult> {
  const fetchImpl = request.fetchImpl ?? globalThis.fetch;

  if (!fetchImpl) {
    return createFailedRemoteCleanupBoundaryResult(false, request.oldBranchName, ['fetch_unavailable']);
  }

  const responseBodyHashes: string[] = [];
  const blockReasons: string[] = [];
  const oldBranchNameHash = `sha256:${hashText(request.oldBranchName)}`;
  const oldPrNumberHash = request.oldPrNumber
    ? `sha256:${hashText(request.oldPrNumber)}`
    : undefined;

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

    let oldPrClosed = false;
    if (request.oldPrNumber) {
      const oldPr = await fetchFixedGithubGet(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls/${encodePathSegment(request.oldPrNumber)}`,
      );
      responseBodyHashes.push(oldPr.bodyHash);
      if (!oldPr.ok) {
        blockReasons.push(`old_pr_metadata_http_${oldPr.status}`);
      }
    }

    const oldBranchRef = await fetchFixedGithubGet(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/ref/heads/${encodePathSegment(request.oldBranchName)}`,
    );
    responseBodyHashes.push(oldBranchRef.bodyHash);
    if (!oldBranchRef.ok) {
      blockReasons.push(`old_branch_ref_http_${oldBranchRef.status}`);
    }

    if (!request.oldBranchName.startsWith('codexhub/')) {
      blockReasons.push('branch_not_codexhub');
    }

    if (blockReasons.length > 0) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        oldPrNumberHash,
        oldBranchNameHash,
        oldPrClosed: false,
        oldBranchDeleted: false,
        blockReasons,
        summary: `GitHub remote cleanup preflight failed: ${blockReasons.join(', ')}.`,
      };
    }

    if (request.oldPrNumber) {
      const closePr = await fetchFixedGithubPatchJson(
        fetchImpl,
        request,
        `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/pulls/${encodePathSegment(request.oldPrNumber)}`,
        { state: 'closed' },
      );
      responseBodyHashes.push(closePr.bodyHash);
      if (!closePr.ok) {
        blockReasons.push(`close_pr_http_${closePr.status}`);
      }
      oldPrClosed = closePr.ok;
    }

    if (blockReasons.length > 0) {
      return {
        status: 'failed',
        networkBoundaryInvoked: true,
        responseBodyHashes,
        oldPrNumberHash,
        oldBranchNameHash,
        oldPrClosed,
        oldBranchDeleted: false,
        blockReasons,
        summary: `GitHub remote cleanup close PR step failed: ${blockReasons.join(', ')}.`,
      };
    }

    const deleteRef = await fetchFixedGithubDelete(
      fetchImpl,
      request,
      `/repos/${encodePathSegment(request.owner)}/${encodePathSegment(request.repo)}/git/refs/heads/${encodePathSegment(request.oldBranchName)}`,
    );
    responseBodyHashes.push(deleteRef.bodyHash);
    if (!deleteRef.ok) {
      blockReasons.push(`delete_ref_http_${deleteRef.status}`);
    }

    return {
      status: deleteRef.ok ? 'completed' : 'failed',
      networkBoundaryInvoked: true,
      responseBodyHashes,
      oldPrNumberHash,
      oldBranchNameHash,
      oldPrClosed,
      oldBranchDeleted: deleteRef.ok,
      blockReasons,
      summary: deleteRef.ok
        ? 'GitHub remote cleanup HTTP boundary completed with hash-only close/delete summaries.'
        : `GitHub remote cleanup HTTP boundary failed: ${blockReasons.join(', ')}.`,
    };
  } catch {
    return {
      ...createFailedRemoteCleanupBoundaryResult(true, request.oldBranchName, [
        'github_remote_cleanup_network_failure',
      ]),
      responseBodyHashes,
      oldPrNumberHash,
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

async function fetchFixedGithubPatchJson(
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
    method: 'PATCH',
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

async function fetchFixedGithubDelete(
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
    method: 'DELETE',
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

async function executeFixedGithubPrManagementWrite(
  fetchImpl: typeof fetch,
  request: GithubPrManagementHttpBoundaryRequest,
): Promise<{
  ok: boolean;
  status: number;
  bodyHash: string;
  bodyText: string;
}> {
  const owner = encodePathSegment(request.owner);
  const repo = encodePathSegment(request.repo);
  const prNumber = encodePathSegment(request.prNumber);

  switch (request.managementKind) {
    case 'labels':
      return fetchFixedGithubPostJson(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/issues/${prNumber}/labels`,
        { labels: request.itemSummaries },
      );
    case 'assignees':
      return fetchFixedGithubPostJson(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/issues/${prNumber}/assignees`,
        { assignees: request.itemSummaries },
      );
    case 'reviewers':
      return fetchFixedGithubPostJson(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`,
        { reviewers: request.itemSummaries },
      );
    case 'milestones': {
      const milestone = Number.parseInt(request.itemSummaries[0] ?? '', 10);
      return fetchFixedGithubPatchJson(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/issues/${prNumber}`,
        { milestone: Number.isFinite(milestone) ? milestone : undefined },
      );
    }
    case 'comments':
      return fetchFixedGithubPostJson(
        fetchImpl,
        request,
        `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
        { body: createFixedPrManagementComment(request) },
      );
  }
}

function createFixedPrManagementComment(request: GithubPrManagementHttpBoundaryRequest): string {
  const summary = request.payloadSummary ?? 'CodexHub governed PR lifecycle update.';
  const itemCount = request.itemSummaries.length;

  return [
    'CodexHub governed PR update',
    '',
    `Summary: ${summary}`,
    `Metadata item count: ${itemCount}`,
    '',
    'This comment was generated from approved metadata summaries; raw prompt, diff, PR body, and response bodies are not persisted by CodexHub.',
  ].join('\n');
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

function createFailedPrManagementBoundaryResult(
  networkBoundaryInvoked: boolean,
  request: GithubPrManagementHttpBoundaryRequest,
  blockReasons: string[],
): GithubPrManagementHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    prNumberHash: request.prNumber ? `sha256:${hashText(request.prNumber)}` : undefined,
    payloadHash: `sha256:${hashText(
      JSON.stringify({
        managementKind: request.managementKind,
        itemSummaries: request.itemSummaries,
        payloadSummary: request.payloadSummary ?? '',
      }),
    )}`,
    itemCount: request.itemSummaries.length,
    changed: false,
    blockReasons,
    summary: `GitHub PR ${request.managementKind} HTTP boundary failed: ${blockReasons.join(', ')}.`,
  };
}

function createFailedPrLifecycleBoundaryResult(
  networkBoundaryInvoked: boolean,
  blockReasons: string[],
): GithubPrLifecycleHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    checkRunCount: 0,
    statusContextCount: 0,
    failedCheckCount: 0,
    pendingCheckCount: 0,
    passedCheckCount: 0,
    blockReasons,
    summary: `GitHub PR lifecycle HTTP boundary failed: ${blockReasons.join(', ')}.`,
  };
}

function createFailedRemoteCleanupBoundaryResult(
  networkBoundaryInvoked: boolean,
  oldBranchName: string,
  blockReasons: string[],
): GithubRemoteCleanupHttpBoundaryResult {
  return {
    status: 'failed',
    networkBoundaryInvoked,
    responseBodyHashes: [],
    oldBranchNameHash: `sha256:${hashText(oldBranchName)}`,
    oldPrClosed: false,
    oldBranchDeleted: false,
    blockReasons,
    summary: `GitHub remote cleanup HTTP boundary failed: ${blockReasons.join(', ')}.`,
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

function extractPullRequestLifecycleMetadata(
  bodyText: string,
  requestedPrNumber: string | undefined,
): {
  prNumberHash?: string;
  prUrlHash?: string;
  stateSummary?: string;
  headCommitSha?: string;
} {
  try {
    const parsed = JSON.parse(bodyText) as unknown;
    const record = Array.isArray(parsed) ? parsed[0] : parsed;

    if (!record || typeof record !== 'object') {
      return {};
    }

    const objectRecord = record as Record<string, unknown>;
    const head = objectRecord.head;
    const headCommitSha =
      head && typeof head === 'object'
        ? (head as Record<string, unknown>).sha
        : undefined;
    const prNumber =
      typeof objectRecord.number === 'number'
        ? String(objectRecord.number)
        : requestedPrNumber;
    const prNumberHash = prNumber ? `sha256:${hashText(prNumber)}` : undefined;
    const prUrlHash =
      typeof objectRecord.html_url === 'string'
        ? `sha256:${hashText(objectRecord.html_url)}`
        : undefined;
    const stateSummary =
      typeof objectRecord.state === 'string' ? objectRecord.state : undefined;

    return {
      prNumberHash,
      prUrlHash,
      stateSummary,
      headCommitSha: typeof headCommitSha === 'string' ? headCommitSha : undefined,
    };
  } catch {
    return {};
  }
}

function countCombinedStatusContexts(bodyText: string): {
  total: number;
  failed: number;
  pending: number;
  passed: number;
} {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const statuses = Array.isArray(parsed.statuses) ? parsed.statuses : [];

    return statuses.reduce(
      (counts, status) => {
        const state =
          status && typeof status === 'object'
            ? (status as Record<string, unknown>).state
            : undefined;
        counts.total += 1;
        if (state === 'success') {
          counts.passed += 1;
        } else if (state === 'pending' || state === 'expected') {
          counts.pending += 1;
        } else {
          counts.failed += 1;
        }
        return counts;
      },
      { total: 0, failed: 0, pending: 0, passed: 0 },
    );
  } catch {
    return { total: 0, failed: 0, pending: 0, passed: 0 };
  }
}

function countCheckRuns(bodyText: string): {
  total: number;
  failed: number;
  pending: number;
  passed: number;
} {
  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    const runs = Array.isArray(parsed.check_runs) ? parsed.check_runs : [];

    return runs.reduce(
      (counts, run) => {
        const runRecord = run && typeof run === 'object' ? (run as Record<string, unknown>) : {};
        const status = runRecord.status;
        const conclusion = runRecord.conclusion;
        counts.total += 1;
        if (status !== 'completed' || conclusion === null || conclusion === undefined) {
          counts.pending += 1;
        } else if (
          conclusion === 'success' ||
          conclusion === 'neutral' ||
          conclusion === 'skipped'
        ) {
          counts.passed += 1;
        } else {
          counts.failed += 1;
        }
        return counts;
      },
      { total: 0, failed: 0, pending: 0, passed: 0 },
    );
  } catch {
    return { total: 0, failed: 0, pending: 0, passed: 0 };
  }
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string): string {
  return encodeURIComponent(value);
}

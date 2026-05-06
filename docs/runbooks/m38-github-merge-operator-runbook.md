# M38 GitHub Merge Operator Runbook

## Preconditions

- `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`
- `CODEXHUB_GITHUB_MERGE_ENABLED=true`
- `CODEXHUB_GITHUB_TOKEN` configured in the local runtime environment
- Target PR is open
- Branch protection, status/checks, and reviews are ready
- Operator has a local-control token for Supervisor POST routes

## Operator Flow

1. Open Dashboard `#/github` and review the GitHub Merge section.
2. Enter the local-control token into the merge guided panel. It stays in page memory and is lost on refresh.
3. Create a merge dry-run with owner/repo/base/head/PR/head SHA metadata.
4. Request readiness approval.
5. Request merge execution approval.
6. Approve readiness and merge execution with two distinct approver tags.
7. Start the merge run with one fixed strategy: `squash`, `merge`, or `rebase`.
8. Review the run summary, evidence refs, audit ids, and boundary booleans.

## Stop Conditions

- Provider or merge flag disabled.
- Token missing.
- PR is not open.
- Head SHA no longer matches the dry-run.
- Checks/status are failed, pending, or missing.
- Required reviews are missing or changes were requested.
- Branch protection summary is blocked.
- Both approvals are not approved, unused, unexpired, and hash-bound.
- Approver hashes match when distinct approvers are required.

## Recovery Notes

- If merge fails before the GitHub network boundary, approvals remain reusable according to their persisted state.
- If the GitHub merge boundary is reached and fails, the merge execution approval is consumed exactly once and the operator must create a fresh dry-run/approval pair for retry.
- CodexHub does not push, force, update refs, create labels, request reviewers, comment, release, deploy, or merge outside the governed merge route.

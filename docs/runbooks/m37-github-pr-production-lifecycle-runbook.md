# M37 GitHub PR Production Lifecycle Runbook

## Purpose

Use this runbook when operating GitHub PR labels, assignees, reviewers, milestones, or comments through CodexHub governance.

## Required Runtime State

- `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`
- `CODEXHUB_GITHUB_TOKEN` configured in the operator environment.
- Exactly one family enablement flag set for the intended action:
  - `CODEXHUB_GITHUB_PR_LABELS_ENABLED=true`
  - `CODEXHUB_GITHUB_PR_ASSIGNEES_ENABLED=true`
  - `CODEXHUB_GITHUB_PR_REVIEWERS_ENABLED=true`
  - `CODEXHUB_GITHUB_PR_MILESTONES_ENABLED=true`
  - `CODEXHUB_GITHUB_PR_COMMENTS_ENABLED=true`
- Persisted dry-run and approval for the selected family.
- Hash-bound owner, repo, PR number, and action metadata matching the persisted dry-run.

## Operator Flow

1. Create a dry-run through the selected Supervisor route family.
2. Review the plan summary, target hashes, action counts, and blockers.
3. Request and approve only the selected family approval.
4. Start the run through the selected family route.
5. Confirm evidence refs, audit ids, boundary booleans, and hash summaries.

## Forbidden Operations

- Merge.
- Push.
- Update or force a ref.
- Remove labels or assignees.
- Dismiss reviewers.
- Clear milestones.
- Edit or delete comments.
- Send arbitrary GitHub endpoints or arbitrary raw comment bodies.

## Rollback Notes

M37 is add/set only and does not include automatic rollback actions. If a PR management action must be reversed, use a later governed cleanup or correction milestone. Do not bypass CodexHub with direct GitHub API calls from the Dashboard, CLI, MCP tools, or tests.

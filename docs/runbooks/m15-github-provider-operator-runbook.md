# M15 GitHub Provider Operator Runbook

Purpose: operate the M15 GitHub provider safely in read-only metadata mode.

Default state:

- `github-provider.enabled=false`.
- `CODEXHUB_GITHUB_PROVIDER_ENABLED` must be explicitly set before live metadata observation can run.
- `CODEXHUB_GITHUB_TOKEN` is read only as configured/missing/hash readiness; the value is never stored or displayed.
- Draft PR creation is not available in M15.

Before enabling metadata observation:

1. Confirm `codexhub github status` shows credential readiness as configured/hash-only.
2. Confirm `codexhub doctor` does not report store or policy blockers.
3. Create a GitHub metadata dry-run through the governed Supervisor route.
4. Review the dry-run target hashes and requested metadata.
5. Record a persisted manual approval through the governed approval path.
6. Execute only if the transient owner/repo/base/head inputs hash-match the dry-run.

Allowed M15 metadata:

- Repository metadata summary.
- Base branch metadata summary.
- Head branch metadata summary.
- Existing open PR count/hash summary.

Blocked M15 operations:

- Push.
- Create/update refs.
- Merge/delete.
- Labels/reviewers/comments/milestones.
- Deployment, release, or tag operations.
- Non-draft PR creation.
- Generic GitHub URL passthrough.

Read-only review commands:

- `codexhub github status`
- `codexhub github metadata dry-runs list`
- `codexhub github metadata runs list`
- `codexhub github metadata runs show <runId>`

Dashboard review:

- Open `#/github`.
- Confirm only hashes, counts, statuses, evidence ids, audit ids, and boundary booleans are visible.
- Do not expect approval or execute buttons in M15c.

Rollback:

1. Unset `CODEXHUB_GITHUB_PROVIDER_ENABLED`.
2. Leave `github-provider.enabled=false`.
3. Treat existing metadata run records as audit evidence only.
4. Remove the Dashboard/CLI read-only entry only if the UX itself is the rollback target.

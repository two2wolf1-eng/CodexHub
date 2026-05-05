# M19 GitHub PR Lifecycle Observation Results

Status: implemented as a governed read-only remote observation slice.

M19 adds PR lifecycle observation on top of the existing GitHub provider without adding a new network boundary file. The existing audited boundary now supports fixed GET requests for repository metadata, PR metadata or existing-PR lookup, branch ref metadata, combined commit status, and check-run summary.

Delivered:

- Contracts for PR lifecycle plans, approvals, runs, and fixture rehearsals.
- Store repositories for PR lifecycle dry-runs, approvals, and runs.
- Supervisor routes under `/api/github/pr-lifecycle/*` with local-control gate, store-resolved approval, request-body authority rejection, and hash-bound runtime input.
- Adapter execution that reports only ids, hashes, counts, statuses, evidence ids, audit ids, and boundary booleans.
- Dashboard `#/github` PR lifecycle panels and CLI read-only commands.
- Fixture rehearsal for all-pass, token-missing, provider-disabled, approval-blocked, pr-not-found, checks-pending, checks-failed, checks-passed, stale-branch, and network-timeout.

Safety state:

- Product default remains disabled.
- Required runtime flags: `CODEXHUB_GITHUB_PROVIDER_ENABLED=true` and `CODEXHUB_GITHUB_PR_LIFECYCLE_OBSERVER_ENABLED=true`.
- Required credential source: `CODEXHUB_GITHUB_TOKEN`; token value is never stored or displayed.
- Read-only observation still requires persisted approval because it crosses a live remote provider boundary.
- Raw PR body, raw response body, raw URL, check logs, comments, review bodies, token values, and local-control keys are not stored.
- Push, update-ref, force, merge, labels, reviewers, comments, and arbitrary endpoint passthrough remain forbidden.

Verification evidence:

- Focused contract, adapter, Supervisor, CLI, and Dashboard tests cover metadata-only output and read-only UX.
- `audit:no-live-automation` continues to require a single GitHub HTTP boundary file.
- Full foundation verification is required before merging this release slice.


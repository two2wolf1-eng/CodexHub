# M19 GitHub PR Lifecycle Operator Runbook

Purpose: observe GitHub PR state, branch ref metadata, combined status, and check-run counts through CodexHub governance.

Enablement:

1. Keep repository config conservative: `github-provider.enabled=false`.
2. Provide `CODEXHUB_GITHUB_TOKEN` in the local runtime environment.
3. Set `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`.
4. Set `CODEXHUB_GITHUB_PR_LIFECYCLE_OBSERVER_ENABLED=true`.
5. Create a PR lifecycle dry-run through the Supervisor control plane.
6. Request and record a persisted approval.
7. Execute the run with only dry-run id, approval artifact id, and transient hash-bound owner/repo/base/head/PR/commit input.

Read-only inspection:

- Dashboard: `#/github`.
- CLI:
  - `codexhub github pr-lifecycle dry-runs list --json`
  - `codexhub github pr-lifecycle approvals list --json`
  - `codexhub github pr-lifecycle runs list --json`
  - `codexhub github pr-lifecycle runs show <runId> --json`
  - `codexhub github pr-lifecycle rehearse --fixture --scenario checks-failed --json`

Stop conditions:

- Token missing.
- Provider flag disabled.
- PR lifecycle observer flag disabled.
- Approval missing, denied, expired, revoked, or used.
- Runtime owner/repo/base/head/PR/commit input does not hash-match the dry-run.
- GitHub returns malformed metadata or network failure.

Rollback:

- Set `CODEXHUB_GITHUB_PR_LIFECYCLE_OBSERVER_ENABLED=false`.
- Keep `github-provider.enabled=false`.
- Remove or disable `/api/github/pr-lifecycle/*` routes if a code rollback is required.
- Keep M16/M17/M18 draft PR and branch publish records intact.


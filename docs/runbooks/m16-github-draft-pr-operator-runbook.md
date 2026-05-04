# M16 GitHub Draft PR Operator Runbook

Purpose: operate the governed GitHub existing-branch draft PR path safely.

Default state:

- `github-provider.enabled=false`.
- `CODEXHUB_GITHUB_PROVIDER_ENABLED` is required for any GitHub HTTP boundary.
- `CODEXHUB_GITHUB_DRAFT_PR_ENABLED` is required for Draft PR creation.
- `CODEXHUB_GITHUB_TOKEN` is read from the local environment and only reported as configured/hash.
- No push, ref creation, merge, label, reviewer, comment, or ready PR operation is available.

Before a live Draft PR attempt:

1. Confirm the remote head branch already exists in GitHub.
2. Confirm `codexhub github status` reports the credential as configured/hash-only.
3. Review the local RC or review package source summary that will feed the PR title/body template.
4. Create a Draft PR dry-run through the governed Supervisor route.
5. Review owner/repo/base/head hashes, generated title hash, body hash, and readiness status.
6. Request and record a persisted approval.
7. Execute only when transient owner/repo/base/head and generated title/body summaries hash-match the dry-run.
8. After execution, review `codexhub github draft-prs runs show <runId>` and Dashboard `#/github`.

Read-only commands:

- `codexhub github status`
- `codexhub github draft-prs dry-runs list`
- `codexhub github draft-prs approvals list`
- `codexhub github draft-prs runs list`
- `codexhub github draft-prs runs show <runId>`
- `codexhub github draft-prs rehearse --fixture --scenario all-pass`
- `codexhub github draft-prs rehearse --fixture --scenario head-branch-missing`

Stop conditions:

- Credential missing.
- Provider or Draft PR env flag disabled.
- Dry-run not planned.
- Approval missing, expired, used, denied, or revoked.
- Execution authority denied or expired.
- Hash mismatch for owner/repo/base/head/title/body.
- Existing open PR found for the same base/head.
- Remote head branch missing.

Rollback:

1. Unset `CODEXHUB_GITHUB_DRAFT_PR_ENABLED`.
2. Unset `CODEXHUB_GITHUB_PROVIDER_ENABLED` if metadata observation is also not needed.
3. Leave `github-provider.enabled=false`.
4. Treat any completed Draft PR run as remote audit evidence.
5. Revoke unused approvals in the approval control plane.
6. Keep local review and RC artifacts intact; no remote branch cleanup is available in M16.

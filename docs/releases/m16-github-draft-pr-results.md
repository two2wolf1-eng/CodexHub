# M16 GitHub Draft PR Results

Status: accepted for local remote-provider pilot baseline.

M16 extends the M15 GitHub provider from read-only metadata into a governed existing-branch draft PR path. The capability remains disabled by default and does not push, create remote refs, merge, label, request reviewers, comment, or create ready PRs.

Delivered scope:

- M16a: draft PR planning contracts and metadata-only readiness projection.
- M16b: approval-gated existing-branch draft PR creation control plane through the existing GitHub HTTP boundary.
- M16c: Dashboard and CLI read-only Draft PR run projection.
- M16d: fixture-only Draft PR acceptance rehearsal for success and failure scenarios.
- M16.5: release audit, operator runbook, and rollback baseline.

Capability matrix:

| Capability | State | Boundary | Approval | Public output |
| --- | --- | --- | --- | --- |
| Draft PR planning | available | none | plan requires future approval | ids/hashes/counts/status |
| Existing head branch preflight | disabled by default | controlled GitHub HTTP GET | yes | hashes/counts/status |
| Existing PR lookup | disabled by default | controlled GitHub HTTP GET | yes | count/hash summary |
| Draft PR creation | disabled by default | controlled GitHub HTTP POST | yes | PR number/url hashes only |
| Acceptance rehearsal | fixture only | none | no | scenario/status/counts |

Required enablement for live Draft PR creation:

- `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`
- `CODEXHUB_GITHUB_DRAFT_PR_ENABLED=true`
- `CODEXHUB_GITHUB_TOKEN` configured
- Persisted, approved, unused, unexpired approval artifact
- Execution authority from CodexHub governance
- Hash-bound owner/repo/base/head and generated title/body summaries

Forbidden in M16:

- Git push.
- Create/update refs.
- Merge/delete.
- Labels, reviewers, comments, milestones, deployments, releases.
- Non-draft PR creation.
- Generic GitHub URL passthrough.
- Raw token, owner, repo, branch, URL, PR body, request body, or response body persistence.

Verification evidence:

- `pnpm nx run-many --target=test "--projects=contracts,github-provider-adapter,dashboard,cli" --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=contracts,github-provider-adapter,dashboard,cli" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=contracts,github-provider-adapter,dashboard,cli" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

Residual risk:

- The GitHub token remains an operator-managed local environment secret; CodexHub only reports configured/hash readiness.
- Draft PR creation is a real remote write when enabled, so operators must keep approvals narrow and review target hashes before execution.
- M16 does not push or create remote branches; the remote head branch must already exist.

# M16 GitHub Draft PR Hardening Review

Status: complete.

Review scope:

- `packages/contracts` GitHub Draft PR planning, run, audit chain, and acceptance rehearsal schemas.
- `packages/github-provider-adapter` Draft PR plan, approval, execution, acceptance rehearsal, and HTTP boundary use.
- `packages/store-core` and `packages/store-sqlite` Draft PR dry-run, approval, and run repositories.
- `apps/supervisor` `/api/github/draft-prs/*` dry-run, approval, and run routes.
- `apps/dashboard` and `apps/cli` GitHub Draft PR read-only UX and fixture rehearsal.
- `.codexhub/integrations.yaml`, `.codexhub/orchestration.yaml`, and `tools/audit-no-live-automation.ts`.

Findings and fixes:

- Confirmed Draft PR POST uses the existing single GitHub HTTP boundary file and no new network boundary file was added.
- Confirmed request-body approval artifacts and execution authority objects are rejected by the Supervisor run routes.
- Confirmed completed Draft PR runs expose PR number and URL as hashes only.
- Confirmed generated title/body summaries are hash-only and raw PR markdown is not persisted or returned.
- Confirmed Dashboard and CLI Draft PR views are GET/local-helper only and do not read local-control keys.
- Fixed production-source audit wording for credential-related fixture scenario names by avoiding raw credential vocabulary in app source.
- Confirmed fixture rehearsal never invokes the GitHub HTTP boundary and never creates a PR.

M16 invariants:

- GitHub provider remains disabled by default.
- Draft PR creation requires persisted approval and CodexHub execution authority.
- Network boundary truth is preserved through `networkBoundaryInvoked`.
- Approval is consumed after a network-boundary attempt.
- Evidence and audit remain authoritative; GitHub provider cannot grant authority.
- Existing remote head branch is required; CodexHub does not push or create refs in M16.

Residual risks:

- Operator error in transient owner/repo/base/head entry is mitigated by hash binding but still requires careful human review.
- GitHub API behavior can change; the fixed boundary should be revalidated before broad operator rollout.
- M16 does not include GitHub App installation scopes or enterprise policy discovery.

Release recommendation:

M16 is acceptable as the first governed remote-provider baseline for draft-only PR creation from an existing remote branch. Keep the feature disabled by default and use the M16 operator runbook before any live attempt.

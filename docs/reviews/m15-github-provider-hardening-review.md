# M15 GitHub Provider Hardening Review

Status: complete.

Review scope:

- `packages/contracts` GitHub provider and draft PR planning schemas.
- `packages/github-provider-adapter` manifest, readiness, metadata planning, and controlled HTTP boundary.
- `packages/store-core` and `packages/store-sqlite` GitHub metadata records.
- `apps/supervisor` GitHub metadata dry-run, approval, and run routes.
- `apps/dashboard` and `apps/cli` GitHub read-only views.
- `.codexhub/integrations.yaml`, `.codexhub/orchestration.yaml`, and `tools/audit-no-live-automation.ts`.

Findings and fixes:

- Added a remote mutation audit vocabulary for GitHub ref, merge, label, comment, reviewer, and non-draft PR surfaces.
- Confirmed the only GitHub network boundary is `packages/github-provider-adapter/src/github-http-boundary.ts`.
- Confirmed Dashboard/CLI GitHub views do not send POST requests, do not call adapter execute, and do not persist control-plane credentials.
- Confirmed token readiness is configured/hash-only and raw token values are not stored.
- Confirmed public metadata output contains no raw owner, repo, branch, URL, request body, response body, or credential value.

M15 invariants:

- GitHub provider remains disabled by default.
- All mutating Supervisor routes require local-control gate and trusted loopback Origin.
- Request-body approval artifacts and execution authorities remain untrusted.
- Boundary truth is preserved through `networkBoundaryInvoked`.
- Evidence and audit remain authoritative; GitHub provider cannot grant authority.

Residual risks for M16:

- Draft PR creation will add a POST boundary and must consume approval once the GitHub network boundary is reached.
- PR title/body generation must remain fixed-template and hash-only.
- M16 must continue forbidding push, ref creation, merge, labels, reviewers, comments, and non-draft PR creation.

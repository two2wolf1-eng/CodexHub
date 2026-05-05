# M22 Remote Cleanup Results

## Scope

M22 adds a governed remote cleanup control plane for closing old CodexHub draft PRs and deleting old CodexHub-created `codexhub/*` branch refs after supersede metadata says cleanup is eligible.

## Delivered

- Added remote cleanup contracts for plans, approvals, run summaries, control-plane runs, and fixture rehearsals.
- Extended the existing audited GitHub HTTP boundary with the fixed cleanup sequence: repo metadata GET, old PR metadata GET, old branch ref GET, draft PR close PATCH, and `codexhub/*` ref DELETE.
- Added store-core/store-sqlite repositories and Supervisor routes under `/api/github/remote-cleanups/*`.
- Added CLI and Dashboard read-only cleanup views and fixture rehearsal summaries.
- Updated GitHub provider governance docs and integration config.

## Safety

- Product default remains disabled. Live cleanup requires `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`, `CODEXHUB_GITHUB_REMOTE_CLEANUP_ENABLED=true`, and `CODEXHUB_GITHUB_TOKEN`.
- POST routes require local-control token plus trusted loopback Origin.
- Request-body approval artifacts and authority objects are rejected.
- Cleanup only targets hash-bound CodexHub-created `codexhub/*` refs and old draft/superseded PR metadata.
- No merge, force, update-ref, push, label, reviewer, comment, release, deployment, or arbitrary GitHub API passthrough is implemented.

## Verification Evidence

M22 acceptance is covered by contracts, GitHub provider, store, Supervisor, CLI, Dashboard, audit, scaffold, and foundation verification gates.

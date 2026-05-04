# M17 GitHub Branch Publish Results

Status: implementation and hardening evidence for the governed GitHub branch publish slice.

## Capability

- Added metadata-only branch publish planning contracts and adapter helpers.
- Added a Supervisor-gated `/api/github/branch-publishes/*` control plane.
- Extended the existing audited GitHub HTTP boundary to create a new `codexhub/*` branch through fixed Git Data API calls.
- Added Dashboard and CLI read-only branch publish views plus fixture-only acceptance rehearsal.

## Safety Baseline

- Product default remains disabled.
- Runtime requires `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`, `CODEXHUB_GITHUB_BRANCH_PUBLISH_ENABLED=true`, and configured `CODEXHUB_GITHUB_TOKEN`.
- POST routes require trusted loopback Origin and the local-control token.
- Approvals are resolved from the Supervisor store; request-body approval artifacts and authority objects are rejected.
- Only new `codexhub/*` branches may be created.
- Local `git push`, update-ref, force, overwrite, merge, labels, reviewers, comments, deployments, releases, and arbitrary endpoint passthrough remain forbidden.

## Evidence Model

Public records expose only ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans. Raw token values, owner/repo/ref strings, raw file content, request body, response body, and commit content are not persisted or returned.

## Verification Targets

- `pnpm nx run github-provider-adapter:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm audit:no-live-automation`
- `pnpm verify:foundation`

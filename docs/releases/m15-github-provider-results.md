# M15 GitHub Provider Results

Status: accepted for M16 planning.

M15 establishes GitHub as the first remote provider without enabling remote mutation. The provider is disabled by default, reads credentials only from local environment readiness, stores no credential value, and exposes only hashes, counts, statuses, evidence refs, audit ids, and boundary booleans.

Delivered scope:

- M15a: GitHub provider contracts, adapter manifest, token readiness, integration decision, and threat model.
- M15b: governed read-only metadata control plane for fixed GitHub GET metadata endpoints.
- M15c: Dashboard `#/github` and CLI read-only commands for provider status and metadata records.
- M15.5: hardening docs and audit rules for remote mutation surfaces.

Capability matrix:

| Capability | State | Boundary | Approval | Public output |
| --- | --- | --- | --- | --- |
| Token readiness | local only | none | no | configured/missing/hash |
| Repo metadata | disabled by default | controlled GitHub HTTP GET | yes | hashes/counts/status |
| Branch metadata | disabled by default | controlled GitHub HTTP GET | yes | hashes/counts/status |
| Existing PR lookup | disabled by default | controlled GitHub HTTP GET | yes | count/hash summary |
| Draft PR creation | deferred to M16 | none in M15 | not available | none |

Forbidden in M15:

- Git push.
- Create/update refs.
- Merge/delete.
- Labels, reviewers, comments, milestones, deployments, releases.
- Non-draft PR creation.
- Generic GitHub URL passthrough.
- Raw owner/repo/ref/url/request/response body persistence.

Verification evidence:

- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=dashboard,cli" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=dashboard,cli" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

Residual risk:

- M16 will introduce draft PR creation and must keep the same single reviewed GitHub HTTP boundary.
- Existing remote head branch verification is still deferred to M16.
- No GitHub provider route should be enabled until operators configure explicit env flags and persisted approvals.

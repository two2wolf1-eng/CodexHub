# 0011 GitHub Provider

Status: M15c governed metadata control plane with read-only UX.

CodexHub integrates GitHub as the first remote provider through a governed adapter. The provider is disabled by default and now supports metadata-only planning, an approval-gated read-only metadata HTTP control plane, and Dashboard/CLI read-only views. Draft PR creation remains deferred to M16.

Boundary rules:

- Token source: `CODEXHUB_GITHUB_TOKEN`.
- Token output: configured/missing plus hash only; never the token value.
- Allowed host: `api.github.com`.
- Product default: disabled.
- M15b runtime enablement: `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`.
- M15b HTTP boundary: exactly one audited module, `packages/github-provider-adapter/src/github-http-boundary.ts`.
- M15b allowed metadata requests: fixed `GET /repos/{owner}/{repo}`, `GET /repos/{owner}/{repo}/branches/{branch}`, and `GET /repos/{owner}/{repo}/pulls?...` against `api.github.com`.
- M15b control plane: Supervisor stores dry-runs, approval records, runs, evidence, and audit records. Mutating routes require the local-control gate and reject request-body approval artifacts or authority objects.
- M15c read-only UX: Dashboard route `#/github` and CLI commands `codexhub github status`, `codexhub github metadata dry-runs list`, `codexhub github metadata runs list`, and `codexhub github metadata runs show <runId>` expose only hashes, counts, statuses, evidence ids, audit ids, and boundary booleans.
- M15c UI/CLI cannot create approvals, run the adapter, send Supervisor POST requests, persist control-plane credentials, or send GitHub network requests.
- Runtime owner/repo/base/head values are transient and must hash-match the persisted dry-run before a request is sent. Public responses expose only ids, hashes, counts, statuses, evidence refs, audit ids, and boundary booleans.
- Forbidden operations: push, create/update refs, merge, delete, labels, reviewers, comments, milestones, deployments, releases, and non-draft PR creation.
- Provider cannot grant authority. CodexHub policy, approval, evidence, and audit remain authoritative.

Rollback for M15c is to remove the `#/github` Dashboard route and CLI read-only commands while keeping the M15b control plane disabled by default. Rollback for the M15b runtime is to disable `CODEXHUB_GITHUB_PROVIDER_ENABLED`, remove the GitHub metadata Supervisor routes/store repositories, and keep the M15a planning/token-readiness adapter disabled. No local git, push, PR creation, or GitHub mutation is part of M15c.

# 0011 GitHub Provider

Status: M16a draft PR planning contracts and provider projection.

CodexHub integrates GitHub as the first remote provider through a governed adapter. The provider is disabled by default and now supports metadata-only planning, an approval-gated read-only metadata HTTP control plane, Dashboard/CLI read-only views, and draft PR readiness planning. Draft PR network creation remains deferred to M16b.

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
- M15.5 hardening: `audit:no-live-automation` enforces the single GitHub HTTP boundary and blocks production-source GitHub ref, merge, label, comment, reviewer, and non-draft PR mutation surfaces.
- M15.5 documents operator handling in `docs/runbooks/m15-github-provider-operator-runbook.md`, release evidence in `docs/releases/m15-github-provider-results.md`, and hardening review in `docs/reviews/m15-github-provider-hardening-review.md`.
- M16a planning: `createGithubDraftPrPlan` produces a metadata-only readiness plan for existing-branch draft PR creation. It accepts source ids from local RC readiness or review package summaries, hashes the generated title/body template summaries, requires an existing remote head branch, blocks when an existing PR is found, and never sends GitHub network requests.
- M16a authority: the plan uses action `github.draft_pr.create` with action mode `write`, requires approval, and never grants execution authority. The future M16b creation path must resolve persisted approval from the store before using the GitHub HTTP boundary.
- Runtime owner/repo/base/head values are transient and must hash-match the persisted dry-run before a request is sent. Public responses expose only ids, hashes, counts, statuses, evidence refs, audit ids, and boundary booleans.
- Forbidden operations: push, create/update refs, merge, delete, labels, reviewers, comments, milestones, deployments, releases, and non-draft PR creation.
- Provider cannot grant authority. CodexHub policy, approval, evidence, and audit remain authoritative.

Rollback for M16a is to keep `github-provider.enabled=false` and remove the draft PR planning helper while leaving M15 metadata and audit protections intact. Rollback for M15.5 is to remove the GitHub read-only UX if needed and preserve the hardening audit until the M16b runtime replaces it with draft-PR-specific checks. Rollback for the M15b runtime is to disable `CODEXHUB_GITHUB_PROVIDER_ENABLED`, remove the GitHub metadata Supervisor routes/store repositories, and keep the M15a planning/token-readiness adapter disabled. No local git, push, PR creation, or GitHub mutation is part of M16a.

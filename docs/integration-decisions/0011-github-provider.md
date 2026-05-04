# 0011 GitHub Provider

Status: M16c draft PR read-only UX.

CodexHub integrates GitHub as the first remote provider through a governed adapter. The provider is disabled by default and now supports metadata-only planning, an approval-gated read-only metadata HTTP control plane, Dashboard/CLI read-only views, draft PR readiness planning, an approval-gated existing-branch draft PR creation control plane, and read-only Draft PR run projection in the operator surfaces.

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
- M16a authority: the plan uses action `github.draft_pr.create` with action mode `write`, requires approval, and never grants execution authority.
- M16b runtime enablement: `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`, `CODEXHUB_GITHUB_DRAFT_PR_ENABLED=true`, and `CODEXHUB_GITHUB_TOKEN` configured.
- M16b control plane: Supervisor adds `/api/github/draft-prs/*` dry-run, approval, and run routes. All POST routes require the local-control gate, resolve approvals from the store, reject request-body approval artifacts or authority objects, and accept only transient hash-bound remote refs and generated title/body summaries.
- M16b HTTP boundary: the same audited `packages/github-provider-adapter/src/github-http-boundary.ts` module performs fixed preflight GETs for repo/base/head/existing-PR metadata and one fixed draft PR creation POST. It never pushes, creates refs, merges, labels, requests reviewers, comments, or creates non-draft PRs.
- M16b public output: completed runs expose run id, remote ref hashes, PR number hash, PR URL hash, response body hashes, evidence refs, audit ids, and boundary booleans only. Raw token, owner, repo, branch, URL, request body, response body, title, and PR markdown body are not persisted or returned.
- M16b approval consumption: any attempt that reaches the GitHub network boundary marks the persisted approval as used. Pre-boundary blocked attempts do not consume approval.
- M16c read-only UX: Dashboard route `#/github` adds Draft PR run metadata, and CLI adds `codexhub github draft-prs dry-runs list`, `codexhub github draft-prs approvals list`, `codexhub github draft-prs runs list`, and `codexhub github draft-prs runs show <runId>`.
- M16c generic run projection includes `github_draft_pr_run`; these views use GET only, do not read local-control keys, do not call adapter execution helpers, and do not send GitHub network requests.
- Runtime owner/repo/base/head values are transient and must hash-match the persisted dry-run before a request is sent. Public responses expose only ids, hashes, counts, statuses, evidence refs, audit ids, and boundary booleans.
- Forbidden operations: push, create/update refs, merge, delete, labels, reviewers, comments, milestones, deployments, releases, and non-draft PR creation.
- Provider cannot grant authority. CodexHub policy, approval, evidence, and audit remain authoritative.

Rollback for M16c is to remove the Draft PR blocks from `#/github` and the `codexhub github draft-prs ...` read-only commands while leaving the M16b control plane disabled by default. Rollback for M16b is to set `CODEXHUB_GITHUB_DRAFT_PR_ENABLED=false`, keep `github-provider.enabled=false`, and remove or disable the `/api/github/draft-prs/*` Supervisor routes/store repositories while preserving M15 metadata and M16a planning. Rollback for M16a is to remove the draft PR planning helper while leaving M15 metadata and audit protections intact. Rollback for M15.5 is to remove the GitHub read-only UX if needed and preserve the hardening audit. Rollback for the M15b runtime is to disable `CODEXHUB_GITHUB_PROVIDER_ENABLED`, remove the GitHub metadata Supervisor routes/store repositories, and keep the M15a planning/token-readiness adapter disabled.

# 0011 GitHub Provider

Status: M15a foundation.

CodexHub will integrate GitHub as the first remote provider through a governed adapter. The provider is disabled by default and starts with metadata-only planning plus token readiness. Network access, metadata reads, and draft PR creation are later control-plane actions that require local-control gate, persisted approval, execution authority, and hash-bound runtime input.

Boundary rules:

- Token source: `CODEXHUB_GITHUB_TOKEN`.
- Token output: configured/missing plus hash only; never the token value.
- Allowed host: `api.github.com`.
- Product default: disabled.
- Forbidden operations: push, create/update refs, merge, delete, labels, reviewers, comments, milestones, deployments, releases, and non-draft PR creation.
- Provider cannot grant authority. CodexHub policy, approval, evidence, and audit remain authoritative.

M15a does not send network requests. Rollback is to remove `@codexhub/github-provider-adapter`, the GitHub contracts, and this disabled integration entry.

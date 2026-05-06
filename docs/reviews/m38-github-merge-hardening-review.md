# M38 GitHub Merge Hardening Review

## Review Scope

Reviewed the governed merge path across contracts, GitHub provider adapter, store, Supervisor, CLI, Dashboard, static audit, and docs.

## Findings And Fixes

- Merge execution is isolated to the existing `github-http-boundary.ts` file. No second network boundary was added.
- Dashboard mutation was added only for the merge wizard and is guarded by exact route allowlists.
- CLI remains read-only for merge execution; it only lists records, shows runs, and runs fixture rehearsal.
- Request-body authority fields remain untrusted: `approvalArtifact`, `executionAuthority`, `authority`, raw PR body, raw URL, raw response body, token, and env values are rejected.
- Merge execution requires both readiness and merge execution approval artifacts, with distinct approver hashes when available.
- Pre-boundary blockers do not consume merge execution approval. Boundary-reached failure consumes merge execution approval exactly once.

## Forbidden Paths

- No push.
- No update-ref.
- No force.
- No labels, reviewers, comments, releases, or deployments.
- No arbitrary GitHub endpoint passthrough.
- No Dashboard, CLI, or MCP direct adapter execution.

## Residual Risk

- Merge is critical risk and should remain runtime-disabled until an operator deliberately configures the provider, token, merge flag, dry-run, two approvals, and acceptance checklist.
- Real merge rollback is inherently manual and repository-specific; the runbook records stop conditions and post-merge verification expectations.

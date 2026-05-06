# M38 GitHub Merge Results

## Scope

M38 adds the first governed merge path for existing GitHub pull requests. The path is disabled by default and is limited to GitHub PR merge with fixed strategies: `squash`, `merge`, and `rebase`.

## Delivered

- Added metadata-only merge contracts for readiness, double approval, run results, and fixture rehearsal.
- Added merge readiness and execution helpers in the GitHub provider adapter using the existing audited GitHub HTTP boundary.
- Added Supervisor control-plane records and routes under `/api/github/merges/*`.
- Added read-only CLI commands for merge dry-runs, approvals, runs, run detail, and fixture rehearsal.
- Added Dashboard `#/github` merge summary plus a guided merge panel scoped to the merge control plane.
- Registered M38 in integrations, orchestration, scaffold health, and no-live audit coverage.

## Safety State

- Product default remains disabled.
- Runtime requires `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`, `CODEXHUB_GITHUB_MERGE_ENABLED=true`, and configured `CODEXHUB_GITHUB_TOKEN`.
- Merge requires two persisted approvals: readiness and merge execution.
- If approver hashes are available, the two approval decisions must come from different approver hashes.
- Public output is limited to ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- The Dashboard merge key is kept in page memory only.

## Verification

Focused verification covered contracts, GitHub provider adapter, store repositories, Supervisor routes, CLI commands, and Dashboard merge UX. Full closeout gates are recorded in the M38 final response for this development round.

## Residual Risk

- No real GitHub merge smoke was run in this round.
- Branch protection interpretation is summarized through fixed GitHub metadata calls and remains conservative.
- M39 GitHub Actions CI/CD integration is not part of M38.

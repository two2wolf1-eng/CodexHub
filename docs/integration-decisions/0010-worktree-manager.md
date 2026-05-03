# 0010 Worktree Manager

## Decision

M6a introduced `@codexhub/worktree-manager` as a fixture-only git capability provider. M6b upgrades it to a Supervisor-gated control plane with one audited controlled git boundary for worktree creation and diff metadata collection.

The boundary is intentionally narrow: it can create a detached local worktree and summarize changed files, but it cannot remove worktrees, push, open pull requests, run arbitrary git commands, or persist raw paths, commands, diffs, or PR text.

## Provider

- Provider: CodexHub builtin
- Adapter: `worktree-manager`
- Capability kind: `git`
- Stage: `m6b-supervisor-gated-controlled-git`
- Default root: repository sibling `../CodexHub-worktrees`
- Product default: disabled
- Enablement flag: `CODEXHUB_WORKTREE_MANAGER_ENABLED=true`

## Runtime Boundary

- External process started: yes, only in `packages/worktree-manager/src/git-process-boundary.ts`
- Shell: forbidden (`shell:false`)
- Allowed commands:
  - `git -C <repoRoot> rev-parse --show-toplevel`
  - `git -C <repoRoot> worktree add --detach <worktreePath> <baseRef>`
  - `git -C <worktreePath> diff --name-only --no-ext-diff`
  - `git -C <worktreePath> diff --numstat --no-ext-diff`
- `git worktree remove`: forbidden in M6b
- `git push`: forbidden
- PR creation: forbidden
- Cleanup deletion: deferred to M6c
- `audit:no-live-automation` allowlist change: exactly one new git process boundary file

## Governance

- Capability providers are not authority providers.
- Dry-runs are persisted by Supervisor and contain only hashes, summaries, and planned boundary booleans.
- Execution requires trusted local-control POST, store-resolved dry-run, store-resolved unexpired unused approval artifact, `ExecutionAuthority.allowed=true`, explicit enablement, and hash-bound transient runtime input.
- Request-body authority or approval artifacts are untrusted and rejected.
- Runtime input must hash-match the persisted dry-run for repo root, worktree root, worktree path, slug, branch, and base ref before git starts.
- Codex and Nx handoff continues to use existing governed adapter paths; M6b does not widen those process boundaries.

## Evidence Policy

- Worktree root and path: hash only
- Repo root: hash only
- Base ref: hash only
- Branch and slug: hash only
- Command summary: hash only
- Changed files: repository-relative metadata only
- Diff body: hash only, never stored
- PR draft body: hash only, never stored
- Release audit text: hash only, never stored
- Raw command body: forbidden
- Cleanup state: `cleanupRequired=true`, `cleanupDeferred=true`

## Rollback

Unset `CODEXHUB_WORKTREE_MANAGER_ENABLED` or keep `.codexhub/integrations.yaml` `worktree-manager.enabled=false` to prevent real git execution. If a run reached the git boundary, the persisted run record carries `cleanupRequired=true` and the hashed worktree path metadata needed for a later approved cleanup workflow. M6b does not delete files automatically.

Rollback of the code path is limited to removing the Supervisor routes and the single audited boundary allowlist entry. No remote repository state is created because push and PR creation are forbidden.

## Tests

- Contract schemas reject raw paths, raw diff body, raw command body, raw PR body, unsafe slugs, and unknown statuses.
- Worktree manager tests cover controlled plan, fixed argv builder, hash binding, disabled boundary, missing approval, injected controlled execution, and metadata-only output.
- Store tests cover dry-run, approval, and run repositories.
- Supervisor tests cover token/origin gate, store-backed approval, untrusted request-body artifacts, disabled/default blocking, approval usage, and metadata-only public output.
- Orchestrator-kernel tests cover M6b ready path, blocked PR readiness on failed handoffs, and no direct process imports outside the audited boundary.

# 0010 Worktree Manager

## Decision

M6a introduced `@codexhub/worktree-manager` as a fixture-only git capability provider. M6b upgraded it to a Supervisor-gated control plane with one audited controlled git boundary for worktree creation and diff metadata collection. M6c extends the same audited boundary file with non-force cleanup under a separate dry-run, approval, and run control plane. M6d adds read-only Dashboard and CLI views over the persisted create and cleanup metadata.

The boundary is intentionally narrow: it can create a detached local worktree, summarize changed files, and remove a clean approved worktree. It cannot force-remove dirty worktrees, push, open pull requests, run arbitrary git commands, use shell mode, fall back to filesystem deletion, or persist raw paths, commands, diffs, or PR text.

## Provider

- Provider: CodexHub builtin
- Adapter: `worktree-manager`
- Capability kind: `git`
- Stage: `m6c-supervisor-gated-controlled-git-and-cleanup`
- Read-only UX stage: `m6d-read-only-control-ux`
- Default root: repository sibling `../CodexHub-worktrees`
- Product default: disabled
- Enablement flag: `CODEXHUB_WORKTREE_MANAGER_ENABLED=true`
- Cleanup enablement flag: `CODEXHUB_WORKTREE_CLEANUP_ENABLED=true`

## Runtime Boundary

- External process started: yes, only in `packages/worktree-manager/src/git-process-boundary.ts`
- Shell: forbidden (`shell:false`)
- Allowed commands:
  - `git -C <repoRoot> rev-parse --show-toplevel`
  - `git -C <repoRoot> worktree add --detach <worktreePath> <baseRef>`
  - `git -C <worktreePath> diff --name-only --no-ext-diff`
  - `git -C <worktreePath> diff --numstat --no-ext-diff`
  - `git -C <repoRoot> worktree list --porcelain`
  - `git -C <worktreePath> status --porcelain --untracked-files=normal`
  - `git -C <repoRoot> worktree remove <worktreePath>`
- `git worktree remove --force`: forbidden
- Filesystem delete fallback: forbidden
- `git push`: forbidden
- PR creation: forbidden
- Cleanup deletion: separate M6c approval flow only
- `audit:no-live-automation` allowlist change: exactly one git process boundary file

## Governance

- Capability providers are not authority providers.
- Dry-runs are persisted by Supervisor and contain only hashes, summaries, and planned boundary booleans.
- Execution requires trusted local-control POST, store-resolved dry-run, store-resolved unexpired unused approval artifact, `ExecutionAuthority.allowed=true`, explicit enablement, and hash-bound transient runtime input.
- Request-body authority or approval artifacts are untrusted and rejected.
- Runtime input must hash-match the persisted dry-run for repo root, worktree root, worktree path, slug, branch, and base ref before git starts.
- Cleanup runtime input must hash-match both the source M6b run and the M6c cleanup dry-run before git starts.
- Cleanup requires the source M6b run to exist in Supervisor store with `cleanupRequired=true`.
- Dirty cleanup status blocks removal after git prechecks; because the git boundary was reached, the cleanup approval is marked used.
- Codex and Nx handoff continues to use existing governed adapter paths; M6b/M6c do not widen those process boundaries.
- M6d Dashboard and CLI read only existing GET endpoints. They do not send local-control tokens, create approvals, execute git, call adapters, push, open PRs, or render raw paths, commands, diffs, or PR bodies.

## Read-Only UX

- Dashboard route: `#/worktrees`
- CLI commands:
  - `codexhub worktrees dry-runs list`
  - `codexhub worktrees approvals list`
  - `codexhub worktrees runs list`
  - `codexhub worktrees runs show <runId>`
  - `codexhub worktrees cleanup dry-runs list`
  - `codexhub worktrees cleanup approvals list`
  - `codexhub worktrees cleanup runs list`
  - `codexhub worktrees cleanup runs show <runId>`
- Generic run commands include `worktree_run` and `worktree_cleanup_run` summaries.
- UX output is limited to ids, statuses, hashes, counts, boundary booleans, evidence ids, audit ids, and summaries.

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
- Cleanup dry-run: hash only
- Cleanup status: dirty count and status hash only
- Cleanup state before approved cleanup: `cleanupRequired=true`, `cleanupDeferred=true`
- Cleanup state after successful approved cleanup: cleanup run records `cleanupCompleted=true`, `cleanupRequired=false`, `cleanupDeferred=false`

## Rollback

Unset `CODEXHUB_WORKTREE_MANAGER_ENABLED` to prevent worktree creation and cleanup git execution. Unset `CODEXHUB_WORKTREE_CLEANUP_ENABLED` to prevent cleanup execution while keeping existing metadata readable. Keep `.codexhub/integrations.yaml` `worktree-manager.enabled=false` to preserve the product default. If a run reached the creation boundary, the persisted run record carries `cleanupRequired=true` and hashed worktree metadata needed for a later approved cleanup workflow.

Rollback of the code path is limited to removing the Supervisor routes and the single audited boundary allowlist entry. No remote repository state is created because push and PR creation are forbidden. M6c cleanup never force-removes and never uses filesystem deletion fallback.

## Tests

- Contract schemas reject raw paths, raw diff body, raw command body, raw PR body, unsafe slugs, and unknown statuses.
- Worktree manager tests cover controlled plan, fixed argv builder, hash binding, disabled boundary, missing approval, injected controlled execution, and metadata-only output.
- Store tests cover worktree create and cleanup dry-run, approval, and run repositories.
- Supervisor tests cover token/origin gate, store-backed approval, untrusted request-body artifacts, disabled/default blocking, approval usage after boundary reach, cleanup dirty/completed metadata, and metadata-only public output.
- Orchestrator-kernel tests cover M6b ready path, blocked PR readiness on failed handoffs, and no direct process imports outside the audited boundary.

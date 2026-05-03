# 0010 Worktree Manager

## Decision

M6a adds `@codexhub/worktree-manager` as a foundation-only git capability provider. It creates governed worktree, patch, PR draft, and release audit metadata, but it does not call `git`, create or delete worktrees, push branches, or open pull requests.

## Provider

- Provider: CodexHub builtin
- Adapter: `worktree-manager`
- Capability kind: `git`
- Stage: `m6a-fixture-only`
- Default root: repository sibling `../CodexHub-worktrees`
- Product default: disabled for real git execution

## Runtime Boundary

- External process started: no
- `git worktree add/remove`: forbidden in M6a
- `git diff`: forbidden in M6a
- Push or PR creation: forbidden in M6a
- Runner: injected fixture only
- `audit:no-live-automation` allowlist change: not required

## Governance

- Capability providers are not authority providers.
- `plan()` produces a dry-run only worktree plan.
- `execute()` requires `ExecutionAuthority.allowed=true`.
- Future real git writes must require dry-run, persisted approval, evidence, and audit.
- Request-body authority or approval artifacts are not trusted by the M6a orchestrator runner.

## Evidence Policy

- Worktree root and path: hash only
- Branch and slug: hash only
- Changed files: repository-relative metadata only
- Diff body: hash only, never stored
- PR draft body: hash only, never stored
- Release audit text: hash only, never stored
- Raw command body: forbidden

## Rollback

Disable the M6a path by removing the `worktree-manager` package from orchestration and scaffold health expectations. Because M6a does not create files, worktrees, branches, pushes, or pull requests, rollback does not require external cleanup.

## Tests

- Contract schemas reject raw paths, raw diff body, raw PR body, unsafe slugs, and unknown statuses.
- Worktree manager tests cover default sibling root, allowlisted roots, blocked unsafe input, missing authority, missing runner, fixture execution, and metadata-only output.
- Orchestrator-kernel tests cover ready, Codex failed, Nx failed, untrusted authority body, and no direct `child_process` import.

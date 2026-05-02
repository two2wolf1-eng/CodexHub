# Round 4G.21 Safety Corrections

## Summary

No code correction was applied in 4G.21.

4G.21 is a docs-only review of the 4F.43 authoritative retry. The retry reached the approved process boundary and returned complete metadata-only diagnostics, but it failed with `process_exit_nonzero`, `exitCode=1`, and `nonzeroExitKind=codex_cli_input_missing_suspected`.

## Why No Code Change Was Applied

The remaining issue is not a docs-only warning issue and not another allowed invocation remediation. The bounded optional route was authorized for CLI invocation/nonzero usage-error closure. 4F.43 moved the failure away from `exitCode=2` usage-error diagnostics and into a new input-governance blocker.

Fixing that safely requires a new design decision:

- what input may be supplied to Codex in read-only pilot mode,
- how to avoid raw prompt or command body persistence,
- how to preserve approval, evidence, and audit binding,
- how to keep subprocess argv fixed and metadata-only,
- how to keep Dashboard, `workspace_write`, and `danger_full_access` blocked.

Those decisions are outside 4G.21 and outside the optional invocation loop.

## Safety Boundary Confirmation

- No pilot was run in 4G.21.
- No real adapter attempt was invoked in 4G.21.
- No approval was created, renewed, revoked, consumed, or marked used.
- No config was changed.
- No Dashboard code or docs were changed.
- No `workspace_write` or `danger_full_access` capability was added.
- No browser/CDP/Profile/Workspace/account automation was used.
- No raw prompt, command, stdout/stderr, argv, executable path, env value, agent body, reasoning body, or raw worktree path was persisted or added to docs.

## Recommendation

Proceed to 4H.16 as a final governance gate for this bounded invocation route. The expected outcome is `no_go_for_mvp`.

After 4H.16, the next new route should be an input-governance remediation round, not another process-start or invocation loop.

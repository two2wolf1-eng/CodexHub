# M36 Local Pilot Live Acceptance

## Summary

M36 advances the `local-patch-review` production template from store-resolved governance binding to operator-facing live acceptance. The acceptance path checks readiness, exercises store-resolved child record rehearsal, and records whether a real local smoke can run under the existing governed recovery and child control planes.

No new Supervisor route, provider, live boundary, remote write, push, or pull request creation was added.

## Delivered

- Added local pilot live acceptance visibility through readiness, Dashboard workflow summaries, and CLI read-only smoke paths.
- Extended store-resolved recovery rehearsal scenarios for missing child refs, hash mismatch, child approval blocks, Codex patch failure, Nx failure, review export block, and resume after child approval.
- Kept the live smoke conditional: when runtime gates, store, token, approvals, and child records are missing, the accepted result is a readiness-blocked summary with operator notes.
- Preserved the M35 rule that recovery runs accept child record ids and hashes only, then resolve real governance state from store.

## Safety

- Workflow approval still cannot grant child authority.
- Child approvals remain separate and are consumed only by child control planes.
- Nx failed or aborted blocks review package export.
- Public output remains ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.
- Real local writes, when an operator configures them, remain limited to existing governed child boundaries: sibling worktree, isolated-worktree Codex patch, Nx verification, and review package artifact export.

## Acceptance Result

This code round does not force a real local smoke. The runtime result is one of:

- `completed`: all required gates, approvals, store records, and child boundaries are configured and the governed local smoke succeeds.
- `readiness-blocked`: one or more runtime gates, approvals, child records, or store prerequisites are missing.

`readiness-blocked` is an accepted delivery result for this round because product defaults remain disabled.

## Verification

Target gates:

- `pnpm nx run-many --target=test "--projects=contracts,workflow-kernel,supervisor,cli,dashboard,operator-readiness-kernel" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

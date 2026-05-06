# M35 Local Production Child Record Binding

## Summary

M35 closes the M34 local production pilot gap where a recovery run could describe child progress in the request body. The `local-patch-review` recovery path now requires child record references and expected hashes, then resolves the real child governance state from the store before the workflow coordinator can start.

No new Supervisor route, provider, live boundary, remote write, push, or pull request creation was added.

## Changes

- Added metadata-only child record contracts for production workflow child references, resolutions, Codex patch child records, and Nx verification child records.
- Added minimal store repositories for `codexPatchChildRecords` and `nxVerificationChildRecords`.
- Hardened `POST /api/workflows/production/recoveries/runs` so it rejects request-body child state such as `childApprovalApproved`, `childRunStatuses`, authority objects, and child artifacts.
- Added store resolution for local child actions: worktree create, Codex patch, Nx verification, and review package export.
- Updated Dashboard and CLI summaries to make the store-resolved binding visible without adding child approval buttons or new CLI mutations.

## Safety

- Workflow approval still cannot grant child authority.
- Child approvals remain separate and are consumed only by child control planes.
- Missing, stale, or hash-mismatched child records block before the workflow coordinator starts.
- Failed Codex patch or Nx verification child records fail the recovery path; Nx failure prevents review package export.
- Public output remains ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.

## Verification

Target gates:

- `pnpm nx run-many --target=test "--projects=contracts,store-core,store-sqlite,workflow-kernel,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=contracts,store-core,store-sqlite,workflow-kernel,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=contracts,store-core,store-sqlite,workflow-kernel,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

# M48f Production GA UX

## Summary

M48f adds operator-facing Production GA surfaces without adding child execution capability.

- Dashboard route `#/production-ga` shows readiness, capability matrix, threat model, training, E2E rehearsal history, signoff state, blockers, evidence, and audit summaries.
- Dashboard guided signoff can POST only to `/api/production-ga/*`; the local-control value is page-memory only.
- CLI adds read-only `codexhub ga ...` commands for status, matrix, threat model, training, rehearsals, and signoffs.

## Safety

- GA UX does not call child adapters.
- GA CLI commands are read-only and do not read local-control tokens.
- Dashboard payloads contain only ids, hashes, statuses, counts, scenario names, and approver hashes.
- No raw E2E payload, child artifact, execution authority, token, path, request body, or response body is sent or displayed.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=dashboard,cli" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=dashboard,cli" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:no-live-automation`
- `git diff --check`

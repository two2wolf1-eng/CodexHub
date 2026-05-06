# M47d Platform Operations UX

## Summary

M47d adds operator-facing platform operations views without adding a new execution path.

- Dashboard `#/operations` shows backup, restore, migration, retention, audit export, operator role, and DR metadata.
- CLI adds read-only `codexhub operations ...` commands for status, family list/show, and fixture rehearsal.
- No platform operation is started from the CLI, and the Dashboard view remains GET-only in this subround.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:build --skip-nx-cache`
- `pnpm nx run cli:build --skip-nx-cache`
- `pnpm nx run dashboard:lint --skip-nx-cache`
- `pnpm nx run cli:lint --skip-nx-cache`

## Residual Risk

M47e still needs fixture acceptance rehearsal coverage for the complete platform operations lifecycle.

# M33 Local Production Pilot Enablement

## Summary

M33 enables the `local-patch-review` production workflow pilot as a runtime-gated, approval-first local chain. The pilot remains disabled by default and uses the existing production recovery control plane rather than adding routes or providers.

## Scope

- Added metadata-only local production pilot contracts and readiness output.
- Added `CODEXHUB_LOCAL_PRODUCTION_WORKFLOW_PILOT_ENABLED` as a separate runtime gate.
- Bound `local-patch-review` recovery planning to existing child control-plane metadata.
- Extended approval inbox and CLI approval decisions to cover review package and production workflow recovery approval records.
- Added Dashboard local pilot guidance without child approval buttons.

## Safety

- No new Supervisor route, provider, store repository, live boundary, or remote write path.
- Workflow recovery approval does not grant child authority.
- Child approvals remain separate and are resolved through existing control planes.
- CLI mutation remains limited to `/api/approvals/decisions`.
- Dashboard mutation remains limited to the existing approval UI and recovery wizard.
- Public output is ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans only.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run workflow-kernel:test --skip-nx-cache`
- `pnpm nx run approval-ux-kernel:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run operator-readiness-kernel:test --skip-nx-cache`

## Residual Risk

The pilot is productized for governed local operation, but actual child execution still depends on each child dry-run, approval, run, hash binding, and runtime enablement flag being present and valid.

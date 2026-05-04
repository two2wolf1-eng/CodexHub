# M10a Pilot Productization

## Summary

M10a adds an operator-facing pilot entry over the existing M9 local pilot, approval UX, doctor, governance projection, and runbook foundation. It does not add execution capability.

## Added

- M10 pilot checklist, operator step, and runbook summary contracts.
- Operator readiness helper for the M10 local pilot checklist.
- Dashboard `#/pilot` read-only view.
- CLI read-only commands:
  - `codexhub pilot m10 checklist`
  - `codexhub pilot m10 runbook`
- M10 operator runbook and checklist documentation.

## Boundaries

M10a does not add Supervisor routes, POST calls, approval mutation, adapter execution, process boundaries, network boundaries, push, PR creation, Browser/Electron/MCP runtime, or real pilot execution.

Dashboard and CLI output remains metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, and audit ids.

## Release Gate

The M10a gate is:

```bash
pnpm nx run-many --target=test "--projects=contracts,operator-readiness-kernel,dashboard,cli" --skip-nx-cache
pnpm nx run-many --target=lint "--projects=contracts,operator-readiness-kernel,dashboard,cli" --skip-nx-cache
pnpm nx run-many --target=build "--projects=contracts,operator-readiness-kernel,dashboard,cli" --skip-nx-cache
pnpm scaffold:health
pnpm audit:boundaries
pnpm audit:sqlite-isolation
pnpm audit:no-live-automation
pnpm audit:skills
pnpm verify:foundation
git diff --check
```

## Next

M10b should add approval decision history projection as a read-only view. M10c should run a fixture acceptance rehearsal for the full operator flow.

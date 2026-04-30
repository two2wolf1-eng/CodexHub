# Round 4D Evidence / Audit / Timeline Integration

## Status

Outcome: `integrated_for_read_only_review`

Round 4D integrates real read-only adapter attempt records into read-only timeline surfaces. This round does not approve broader use, does not add a Dashboard trigger, and does not allow `workspace_write` or `danger_full_access`.

## GSD Spec

Goal: make authoritative attempt evidence queryable as a timeline across contracts, kernel helpers, Supervisor, CLI, and Dashboard read-only review.

Scope:
- `packages/contracts`: timeline entry, summary, and query schemas for attempt metadata.
- `packages/codex-kernel`: pure timeline aggregation from persisted attempt records.
- `apps/supervisor`: read-only attempt timeline endpoint.
- `apps/cli`: read-only attempt timeline query command and degraded display fallback.
- `apps/dashboard`: read-only timeline panel.

Non-scope:
- No new adapter trigger.
- No Dashboard run/start/live/execute/approve-and-run control.
- No raw prompt, command, stdout, stderr, agent, or reasoning body display or persistence.
- No `workspace_write`, `danger_full_access`, browser/CDP/profile/account automation, or broader autonomous use.

Risk level: medium, because this touches API, CLI, and Dashboard review surfaces for a real read-only adapter control plane.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Timeline DTOs are metadata-only | `packages/contracts/src/index.ts` | Added entry/summary/query schemas with fixed no-live and body-storage flags | Continue |
| Kernel aggregation is pure | `packages/codex-kernel/src/real-read-only-adapter.ts` | Aggregates existing attempt records into counts, refs, hashes, and status only | Continue |
| Supervisor endpoint is read-only | `GET /api/codex/exec/real-read-only-adapter/attempt-timeline/:dryRunId` | Reads persisted attempt records and returns timeline metadata | Continue |
| CLI fallback cannot create authority | `apps/cli/src/main.ts` | Timeline fallback is degraded/notPersisted and display-only | Continue |
| Dashboard remains non-triggering | `apps/dashboard/src/App.tsx` | Adds read-only attempt timeline panel only | Continue |

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Raw prompt, command, stdout, stderr, agent, and reasoning bodies remain excluded.
- Timeline records are informational only and do not grant broader use or workspace mutation permission.

## Verification Plan

Focused checks:
- `pnpm nx test contracts`
- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm nx build dashboard`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm audit:no-live-automation`
- `pnpm verify:foundation`
- `git diff --check`
- `git status --short`

Final checks:
- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- `git diff --check`
- `git status --short`

## Round 4E Readiness

Round 4E may be considered only if the focused and final 4D verification checks pass and this round is committed cleanly. Round 4E remains limited to operator UX, runbook, checklist, and read-only explanations.

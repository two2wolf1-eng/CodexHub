# M10c Pilot Acceptance Rehearsal

## Summary

M10c adds a fixture-only operator acceptance rehearsal for the M10 local pilot
product entry. It proves the operator-facing flow can be understood and reviewed
without starting Codex, Nx, Git, Browser, Electron, MCP, or network/exporter
boundaries.

## Delivered

- Added metadata-only M10 acceptance contracts:
  `M10PilotAcceptanceRehearsalRun`, `M10PilotAcceptanceStep`, and
  `M10PilotAcceptanceEvidenceSummary`.
- Added `runM10PilotAcceptanceRehearsal()` in `@codexhub/orchestrator-kernel`.
- Added CLI command:

```bash
codexhub pilot m10 rehearse --fixture [--scenario all-pass|readiness-blocked|approval-blocked|codex-failed|nx-failed]
```

- Added Dashboard `#/pilot` acceptance rehearsal summary.

## Scenarios

- `all-pass`: operator flow is understandable and complete; PR action remains
  `not_ready_no_live_pr`.
- `readiness-blocked`: preflight blocks before fixture pilot stages.
- `approval-blocked`: approval metadata blocks before fixture pilot stages.
- `codex-failed`: fixture Codex stage fails and the run is not passed.
- `nx-failed`: fixture verification fails and PR action is blocked.

## Boundaries

- No Supervisor route.
- No local-control key read.
- No POST request.
- No adapter execute call.
- No process, network, Browser, Electron, MCP, Git, Codex, or Nx runtime boundary.
- No push and no PR creation.
- Public output stores ids, hashes, counts, statuses, summaries, evidence ids,
  and audit ids only.

## Verification

M10c should be accepted only after contracts/orchestrator/Dashboard/CLI tests,
all governance audits, and `pnpm verify:foundation` pass.

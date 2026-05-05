# M20 Rework Loop Results

## Scope

M20 adds a metadata-only rework loop for failed checks, review changes requested, operator-requested retries, and stale-branch recovery. It projects the next attempt, supersede chain, required child approvals, evidence refs, and audit ids without executing patch generation, branch publish, or draft PR creation.

## Delivered

- Added shared rework contracts for plans, approvals, runs, attempt summaries, trigger summaries, supersede projections, and fixture rehearsals.
- Added orchestrator-kernel helpers for rework planning, approval records, metadata-only execution, and acceptance rehearsal.
- Added Supervisor rework loop dry-run, approval, and run control-plane records. POST routes require the local-control gate and reject request-body approval artifacts or authority objects.
- Added store-core/store-sqlite repositories for rework dry-runs, approvals, and runs.
- Added CLI read-only commands under `codexhub rework-loops`.
- Added Dashboard `#/governance` Rework Loop metadata panel.

## Safety

- No new process, network, GitHub, browser, Electron, MCP, or filesystem execution boundary.
- Rework run output is ids, hashes, counts, statuses, summaries, evidence ids, and audit ids only.
- Child control planes remain authoritative for patch, branch publish, and draft PR operations. Rework metadata cannot bypass child dry-run, approval, evidence, or audit gates.
- Raw prompt, diff, PR body, reason, path, URL, response body, token, cookie, session, and local-control key values remain forbidden.

## Verification Evidence

Focused tests covered contracts, orchestrator rework behavior, Supervisor gates, CLI read-only commands, and Dashboard read-only summaries. Full foundation verification is required before the M20 commit.

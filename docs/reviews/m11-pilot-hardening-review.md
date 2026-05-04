# M11 Pilot Hardening Review

## Scope

This review covers M11a-M11d:

- M11 production pilot contracts and orchestrator runner.
- Supervisor M11 local pilot routes and public GET summaries.
- Operator readiness, enablement, failure recovery, cleanup handoff, and acceptance smoke.
- Dashboard `#/pilot` and CLI `codexhub pilot m11 ...` read-only surfaces.
- Governance config, release docs, and scaffold health expectations.

## Findings

No blocking release findings remain after M11d.

The existing static audit already enforces the two highest-risk UI/CLI invariants:

- Dashboard and CLI production sources must not directly call capability adapter execute helpers.
- Dashboard approval UX must not persist the local-control key in browser storage.

The live automation audit also keeps the boundary allowlist unchanged: M11 added no new process,
browser, Electron/CDP, MCP, telemetry exporter, or network boundary.

## Confirmed Invariants

- Mutating pilot execution remains Supervisor-gated.
- Request-body approval artifacts and execution authorities are rejected or ignored in favor of
  store-resolved authority.
- Codex remains read-only/dry-run for M11.
- PR draft state never becomes ready in M11.
- Worktree cleanup is a metadata handoff and does not delete anything from the pilot UI.
- Dashboard and CLI M11 views do not read local-control keys and do not send mutating requests.
- Acceptance smoke is fixture-only and does not invoke live Git/Codex/Nx.
- Public outputs are metadata-only: ids, hashes, counts, statuses, summaries, evidence ids, audit
  ids, and boundary booleans.

## Verification Evidence

- Focused tests for M11d changed projects passed.
- Focused lint/build for contracts, orchestrator-kernel, dashboard, and CLI passed.
- `pnpm scaffold:health` passed.
- `pnpm audit:boundaries` passed.
- `pnpm audit:sqlite-isolation` passed.
- `pnpm audit:no-live-automation` passed.
- `pnpm audit:skills` passed.
- `pnpm verify:foundation` passed.

## Residual Risk

The next material risk appears in M12b, when governed Codex patch generation is allowed inside an
isolated worktree. That round must preserve approval consumption, boundary truth, hash-bound
worktree input, no repo-root mutation, and verification-gated PR draft readiness.

## Recommendation

Proceed to M12a first, not M12b. M12a should be fixture-only contracts and lifecycle foundation so
the patch model is testable before any Codex write-in-worktree execution is enabled.

# M48-D25 Final Deep Debug Runbook

## Purpose

Use this runbook before starting any M49+ work from the M0-M48 Production GA baseline.

## Required Pre-Work Checks

1. Confirm `pnpm scaffold:health` passes.
2. Confirm all governance audits pass.
3. Confirm `pnpm verify:foundation` passes.
4. Confirm the worktree starts clean.
5. Read the M0-M48 capability matrix and update it before adding any new capability surface.

## Stop Conditions

- A new Supervisor route appears without route gate matrix coverage.
- A new provider or live boundary appears without dry-run, approval, evidence, audit, docs, and focused tests.
- UI, CLI, or MCP imports or calls a capability adapter directly.
- GA signoff attempts to substitute for child approvals.
- Public output includes raw prompt, stdout, stderr, diff, path, URL, body, token, cookie, session, env, PR body, release body, deploy payload, log, trace, patch, DB row, or audit body.
- Static audits need a broad allowlist rather than a narrow docs/tests/audit vocabulary exception.

## Baseline Expectations

- Product defaults remain disabled unless explicitly enabled through the governed runtime gates.
- Live smoke is conditional and can be readiness-blocked for environment-only reasons.
- Browser act, Electron main inspector, MCP write tools, deployment writes, external agents, real policy backend runtime, and telemetry network export remain fixed-boundary, approval-gated, and disabled by default.
- Every future milestone needs its own release, review, runbook, tests, audits, and closeout commit.

## Fast Recovery

If a gate fails after future changes:

1. Stop in the current round.
2. Identify whether the failure is implementation, test, docs/config, or audit drift.
3. Fix the root cause without broadening live-boundary allowlists.
4. Rerun the failed check, then rerun full closeout gates.
5. Commit only after the worktree is clean.

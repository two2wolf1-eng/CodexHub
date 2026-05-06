# M47 Final Governance Baseline Runbook

## Purpose

Use this runbook before starting any post-M47 feature milestone. It confirms that the platform still begins from the verified M0-M47 governance baseline.

## Standard Flow

1. Confirm the worktree is clean.
2. Review `docs/reviews/m0-m47-capability-governance-matrix.md`.
3. Run the foundation gates:
   - `pnpm scaffold:health`
   - `pnpm audit:boundaries`
   - `pnpm audit:sqlite-isolation`
   - `pnpm audit:no-live-automation`
   - `pnpm audit:skills`
   - `pnpm verify:foundation`
   - `git diff --check`
4. If a gate fails, fix only the root drift before starting feature work.
5. For new capability work, update contracts first, then kernels and stores, then apps.
6. Keep all new writes behind dry-run, persisted approval, evidence, and audit.

## Stop Conditions

- New POST route without route-gate matrix coverage.
- New provider, route, store repository, or live boundary without a milestone plan and review docs.
- Dashboard, CLI, or MCP direct adapter execution.
- Raw prompt, output, diff, path, URL, body, token, env, policy input, trace, log, patch, database row, or audit body in public output.
- Runtime, external agent, platform operation, Browser, Electron, MCP, policy, telemetry, GitHub, deployment, release, or secrets behavior that bypasses CodexHub authority.

## Recovery

If baseline drift is found, create a dedicated debug round and commit the narrowest fix. Do not combine drift repair with new capability implementation.

# M8a Release Candidate Operator Runbook

Date: 2026-05-04

## Purpose

Use this runbook to assess the M0-M7 release candidate without enabling new
runtime behavior. M8a is a release-hardening round, not an execution round.

## Operator Preconditions

- Worktree is clean.
- The operator has reviewed `.codexhub/integrations.yaml`.
- Product defaults remain disabled for live Codex, Nx, Browser, Electron/CDP,
  Worktree, Policy backend, and Telemetry runtime/export behavior except MCP
  read-only mode.
- No local-control token is placed in Dashboard configuration.
- No new env flag is enabled solely for M8a.

## Review Sequence

1. Review the capability matrix:

   ```text
   docs/releases/m8a-release-candidate-baseline.md
   ```

2. Review threat model stop conditions:

   ```text
   docs/threat-model/m8a-release-candidate-threat-model.md
   ```

3. Review integration-specific decisions:

   ```text
   docs/integration-decisions/0001-codex-cli-adapter.md
   docs/integration-decisions/0002-mcp-typescript-sdk.md
   docs/integration-decisions/0003-nx-affected-adapter.md
   docs/integration-decisions/0004-playwright-observer.md
   docs/integration-decisions/0005-electron-cdp-boundary.md
   docs/integration-decisions/0006-opa-cedar-policy-backend-evaluation.md
   docs/integration-decisions/0007-opentelemetry-trace-boundary.md
   docs/integration-decisions/0010-worktree-manager.md
   ```

4. Run the release gates:

   ```powershell
   pnpm scaffold:health
   pnpm audit:boundaries
   pnpm audit:sqlite-isolation
   pnpm audit:no-live-automation
   pnpm audit:skills
   pnpm verify:foundation
   git diff --check
   git status --short --branch
   ```

5. Record the result in the release notes or final PR summary using command
   names, pass/fail state, and any residual risk. Do not paste raw runtime data.

## Safe Read-Only Surfaces

- Dashboard hash views:
  - `#/overview`
  - `#/verification`
  - `#/mcp-tools`
  - `#/browser-profiles`
  - `#/electron`
  - `#/worktrees`
  - `#/policy-telemetry`
- CLI read-only commands:
  - `codexhub runs list/show`
  - `codexhub evidence list/show`
  - `codexhub mcp tools list/show`
  - `codexhub verify affected --dry-run`
  - `codexhub browser profiles list`
  - `codexhub electron ... list/show`
  - `codexhub worktrees ... list/show`
  - `codexhub policy-backend status/plan`
  - `codexhub telemetry status/projection show`

## Forbidden During M8a

- Enabling new live runtime flags as part of M8a.
- Creating new Supervisor routes.
- Creating new Dashboard/CLI write actions.
- Calling adapter `execute()` from UI, CLI, or MCP.
- Starting OPA, Cedar, OpenTelemetry exporters, Browser automation, Electron main
  inspector, generic CDP command passthrough, git push, or PR creation.
- Persisting raw prompt/stdout/stderr/diff/trace/network/URL/path/credential-like
  bodies.

## Escalation

If a release gate fails, stop. Fix the smallest concrete issue, rerun focused
tests first, then rerun the full release gates.

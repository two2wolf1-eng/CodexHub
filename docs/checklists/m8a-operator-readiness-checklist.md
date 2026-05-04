# M8a Operator Readiness Checklist

Date: 2026-05-04

Use this checklist before treating M0-M7 as a release candidate baseline.

## Governance

- [ ] `.codexhub/integrations.yaml` reviewed.
- [ ] Product defaults are conservative.
- [ ] Capability providers are not authority providers.
- [ ] Store-resolved approvals are required for gated executions.
- [ ] Request-body approval artifacts remain untrusted.
- [ ] Evidence is metadata/hash-only for sensitive surfaces.
- [ ] Audit events include actor, action, target, reason, policy decision, and evidence refs.

## Capability Matrix

- [ ] Codex CLI boundary is existing/audited only.
- [ ] Nx boundary is existing/audited only.
- [ ] MCP tools are read-only by default.
- [ ] Browser observation is disabled by default and no act path is exposed.
- [ ] Electron/CDP is disabled by default and command passthrough is forbidden.
- [ ] Worktree git boundary is disabled by default and cannot push/open PR.
- [ ] Policy backend is advisory only.
- [ ] Telemetry projection is local metadata only.

## Operator Environment

- [ ] No new live enablement env flag is set for M8a.
- [ ] Dashboard has no local-control token.
- [ ] Read-only CLI commands do not read local-control token.
- [ ] SQLite state is available for read-only review where needed.
- [ ] No raw runtime data is copied into release notes.

## Verification

- [ ] `pnpm scaffold:health`
- [ ] `pnpm audit:boundaries`
- [ ] `pnpm audit:sqlite-isolation`
- [ ] `pnpm audit:no-live-automation`
- [ ] `pnpm audit:skills`
- [ ] `pnpm verify:foundation`
- [ ] `git diff --check`
- [ ] `git status --short --branch`

## Release Decision

- [ ] All verification gates passed.
- [ ] No M8a code path adds runtime behavior.
- [ ] Residual risks are documented.
- [ ] Next recommended round is M8b unified run/evidence/audit projection.

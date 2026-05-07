# M48 Production GA Release

## Summary

M48 closes the CodexHub production GA release track. It adds the Production GA governance layer, full capability matrix, threat model, operator training, E2E rehearsal, release candidate signoff, and audit hardening without adding a new execution provider or live boundary.

## GA Scope

- Production GA control plane: `/api/production-ga/*`.
- Dashboard route: `#/production-ga`.
- CLI read-only group: `codexhub ga ...`.
- Kernel/store: metadata-only GA aggregation records.
- Fixture E2E rehearsal: patch -> verify -> PR -> merge -> release -> deploy -> observe -> rollback.
- Conditional live smoke: allowed only when all existing child gates, env, approvals, and records are configured; otherwise recorded as `readiness_blocked`.

## Safety Position

- GA signoff is critical risk.
- GA signoff requires two distinct persisted approvals.
- GA approval cannot replace child approvals.
- GA kernel aggregates child control-plane ids/hashes only.
- No child adapter, GitHub, deployment, browser, Electron, MCP, policy, telemetry, external-agent, or workflow adapter is called directly by GA.
- Public output remains metadata-only.

## Release Evidence

- M48a through M48i were delivered as independent commits with release, review, and runbook docs.
- M48 final closeout runs the full foundation gate set before release commit.

## Residual Risk

The platform is production-GA ready only under the governed model documented here. Future new provider surfaces or live boundaries must enter through a new milestone with dry-run, approval, evidence, audit, threat model, and operator training updates.

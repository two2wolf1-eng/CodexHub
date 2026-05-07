# M48 Production GA Operator Runbook

## Purpose

This runbook describes the minimum operator process for treating CodexHub as a production-grade DevOps automation platform under the M48 governance baseline.

## Before GA Signoff

1. Review the M0-M48 capability matrix.
2. Review the M48 threat model.
3. Confirm operator training completion status.
4. Run fixture E2E rehearsal for patch -> verify -> PR -> merge -> release -> deploy -> observe -> rollback.
5. Review conditional live smoke status. `readiness_blocked` is acceptable only for environment-not-configured blockers.
6. Confirm no unresolved critical residual risk.
7. Collect two distinct GA approvals.

## Signoff Rules

- Use only `/api/production-ga/*` for GA control-plane mutation.
- Never treat GA approval as child authority.
- Never paste raw E2E payloads, release bodies, deployment payloads, logs, traces, patches, DB rows, or audit bodies into GA requests.
- Review evidence refs and audit ids before signoff.

## Rollback

GA signoff does not roll back child systems. Child rollbacks remain owned by their existing control planes, especially deployment rollback plans and platform restore rehearsals.

## Stop Conditions

- Missing or duplicate GA approver hashes.
- Failed fixture E2E rehearsal.
- Missing threat model or capability matrix.
- Missing required operator training without accepted non-critical blocker.
- Unresolved critical residual risk.
- Any no-live automation audit failure.

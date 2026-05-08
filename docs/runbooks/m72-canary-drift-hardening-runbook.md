# M72 Canary / Drift Hardening Runbook

## Operator Model

Before any high-risk Business admin write or Codex dispatch, production readiness must be clear. The readiness gate is metadata-only, but it is authoritative as a blocker: a failed canary or incompatible drift record stops live admin write execution and dispatch readiness.

## Required Checks

1. Run production-readiness rehearsal for owner admin members.
2. Run production-readiness rehearsal for owner admin billing.
3. Run pending-invites and manage-seats canaries before membership or seat changes.
4. Run App Server quota canary before Codex dispatch.
5. Run selector and network-endpoint drift gates before any approved admin write live smoke.

## Block Handling

- `canary_blocked` means the observed surface did not pass enough checks. Do not retry the write; rerun the canary after fixing the underlying operator or UI state.
- `drift_blocked` means selector, endpoint, schema, redaction, or combined drift made the live path unsafe. Refresh the dry-run and review the new hashes before requesting approval.
- `production_readiness_blocked` on quota or fusion output means Codex dispatch is blocked by the production readiness layer, not by quota alone.

## Recovery

Keep the latest readiness records as the source of truth. If a blocker was caused by stale data, rerun the relevant canary/drift rehearsal and confirm `/api/production-readiness/summary` reports no high-risk live blocker before starting admin writes or dispatching Codex work.

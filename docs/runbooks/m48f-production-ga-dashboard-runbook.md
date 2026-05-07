# M48f Production GA Dashboard Runbook

## Purpose

Use `#/production-ga` to review GA readiness and, when explicitly enabled, guide GA dry-run, training completion, rehearsal recording, approval recording, and signoff through the Production GA control plane.

## Procedure

1. Open `#/production-ga`.
2. Review capability matrix and threat model hashes.
3. Review training completion and E2E rehearsal status.
4. Enter the local-control value only in the page field when a governed GA POST is required.
5. Create a GA dry-run.
6. Record two distinct GA approvals.
7. Record E2E rehearsal and training completion metadata.
8. Run GA signoff only when no critical blockers remain.

## Boundaries

- The Dashboard posts only to `/api/production-ga/*`.
- The local-control value is never saved to browser storage or URL state.
- GA signoff does not replace child approvals and cannot call child adapters.
- CLI GA commands remain read-only.

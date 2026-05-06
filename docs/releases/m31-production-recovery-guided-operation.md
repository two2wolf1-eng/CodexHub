# M31 Production Recovery Guided Operation

## Summary

M31 adds a Dashboard-guided recovery operation panel on `#/workflows`. The panel is an operator workflow for the existing production recovery control plane; it does not add a Supervisor route, provider, store repository, adapter boundary, or CLI mutation.

Supported templates:

- `local-patch-review`
- `github-draft-pr-chain`
- `rework-cleanup`

## Governance Boundaries

- Dashboard POST calls are limited to `/api/workflows/production/recoveries/*`.
- The local-control key is entered by the operator and kept only in React page memory.
- The key state is displayed only as `entered` or `missing`.
- The Dashboard does not send request-body approval artifacts, execution authority objects, child artifacts, raw paths, raw bodies, or raw secrets.
- Workflow recovery approval does not grant child authority.
- Child actions remain separately governed by their own child control planes.

## Operator Flow

1. Select a production recovery template.
2. Enter the local-control key for the current page session.
3. Create a recovery dry-run.
4. Request workflow recovery approval.
5. Approve the workflow recovery request.
6. Start the recovery run.
7. If the run waits for child approval, resolve child approvals separately, then resume from the last safe metadata step.

## Verification Evidence

M31 is covered by Dashboard source tests, Supervisor recovery route tests, and the no-live automation audit. Full verification is recorded in the M32 closeout.


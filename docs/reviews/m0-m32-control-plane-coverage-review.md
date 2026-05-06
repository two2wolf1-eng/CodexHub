# M0-M32 Control-Plane Coverage Review

Date: 2026-05-06

## Review Focus

This review focused on route coverage drift in late-stage governance surfaces:

- Local review package export
- Local RC bundle export
- GitHub metadata, PR lifecycle, branch publish, draft PR, publish-to-draft chain, and remote cleanup
- Rework loop
- Custom workflow
- Production workflow recovery

## Finding

The prior coverage guard compared a flat route list against registered Supervisor routes. That caught missing route entries but did not encode whether a route family was expected to own approvals directly or rely on child control planes.

## Fix

The test suite now uses a control-plane matrix:

- Each family has a stable prefix.
- Each family must expose `dry-runs` and `runs`.
- Families that manage their own approvals must expose `approval-requests` and `manual-approvals`.
- The publish-to-draft chain remains explicitly marked as child-approval-managed.

## Residual Risk

If a future route family has a deliberately different shape, the matrix must be updated in the same change. That is intentional: route shape changes should be visible during code review.

## Verification Evidence

Captured in the M32.3 release closeout.


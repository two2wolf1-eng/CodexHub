# M0-M32 Approval Boundary Failure Review

Date: 2026-05-06

## Review Focus

This review focused on late-stage approval state transitions in blocked and boundary-started paths.

Reviewed representative surfaces:

- GitHub draft PR creation
- GitHub branch publish
- GitHub remote cleanup
- Custom workflow coordination
- Production workflow recovery

## Finding

The existing tests asserted that completed boundary attempts consume approval and that several blocked paths keep boundary booleans false. Some representative pre-boundary mismatch paths did not explicitly assert that the approval remained approved/unused before the later successful run.

## Fix

Added explicit approval-state checks immediately after pre-boundary mismatch and child-record blocks. Added request-count checks on GitHub paths to prove pre-boundary blocks do not touch the network boundary.

## Residual Risk

The test suite uses injected/fixture runners, not live GitHub writes. That is intentional for this hardening round. Future live-boundary changes must add their own injected failure cases before being enabled.

## Verification Evidence

Captured in the M32.5 release closeout.

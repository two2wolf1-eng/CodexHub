# M0-M32 Public Projection Round-Trip Review

Date: 2026-05-06

## Review Focus

This review focused on whether metadata-only guarantees survive a serialize, store/list/get, and public projection round-trip.

Reviewed representative surfaces:

- Governance projection
- Operator readiness
- Approval decision history
- Review package and release candidate summaries
- GitHub provider summaries and publish-to-draft-PR chain records
- Custom workflow and production recovery summaries

## Finding

Most projection packages already used the shared adversarial public-output fixture to prove raw prompt, stdout, stderr, diff, path, URL, file content, PR markdown, reason, token, cookie, session, env value, request body, and response body text are not emitted.

The explicit store round-trip assertion for the GitHub publish-to-draft-PR chain was thinner than the adjacent GitHub draft PR and branch publish repositories.

## Fix

Added the same adversarial public-output round-trip guard to GitHub publish-to-draft-PR chain store list/get records.

## Residual Risk

Store repositories intentionally preserve the records they are given. Public safety therefore depends on upstream helpers and control planes continuing to write metadata-only records. The regression net now covers representative late-stage store list/get paths, but future new store repositories must add their own round-trip tests.

## Verification Evidence

Captured in the M32.4 release closeout.

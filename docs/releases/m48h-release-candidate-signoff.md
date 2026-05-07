# M48h Release Candidate Signoff

## Summary

M48h tightens Production GA release-candidate signoff semantics.

- GA signoff still requires two distinct approved GA approvals.
- Unresolved critical risks block signoff.
- Foundation gates, capability matrix, threat model, operator training, and fixture E2E must be `ready`.
- `conditionally_ready` is reserved for conditional live-smoke readiness blockers only.
- Failed E2E or other failed gate state produces a failed signoff without consuming approvals.

## Safety

- GA signoff aggregates existing metadata only.
- GA approval does not replace child approvals.
- The signoff path does not call child adapters or expand live boundaries.
- Public output remains ids, hashes, counts, statuses, evidence refs, audit ids, and boundary booleans.

## Verification

- `pnpm nx run-many --target=test "--projects=production-ga-kernel,supervisor" --skip-nx-cache`
- `pnpm nx run-many --target=lint "--projects=production-ga-kernel,supervisor" --skip-nx-cache`
- `pnpm nx run-many --target=build "--projects=production-ga-kernel,supervisor" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:no-live-automation`
- `git diff --check`

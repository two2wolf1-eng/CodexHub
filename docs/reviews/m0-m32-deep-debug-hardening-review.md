# M0-M32 Deep Debug Hardening Review

Date: 2026-05-06

## Review Focus

This review targeted a narrow residual risk in the M31/M32 recovery guided operation:

- Future Dashboard changes could reintroduce raw free-form recovery reasons under a different variable name.
- Future Dashboard changes could replace exact recovery route allowlisting with prefix or substring matching.
- Static audit negative fixtures could miss these variants.

## Findings

### Fixed: Recovery wizard raw reason variants were not independently audited

The prior audit caught `reason: recoveryReason`, but not semantically equivalent payloads such as `reason: rawReason` or `reasonSummary`.

Fix:

- Added scoped audit windows for `requestRecoveryApproval`, `approveRecoveryRequest`, and `runRecovery`.
- The scoped checks forbid raw reason payloads, authority objects, child artifacts, child approval shortcuts, and child run status payloads.

### Fixed: Recovery route guard variants were not independently audited

The prior audit caught the exact `startsWith('/api/workflows/production/recoveries/')` string, but not prefix aliases such as `path.startsWith(recoveryPrefix)`.

Fix:

- Added scoped checks for the recovery POST helper.
- The helper must use `recoveryDashboardPostRoutes.has(path)`.
- Prefix, substring, and dynamic route guard variants are rejected.

## Residual Risk

- The Dashboard recovery wizard remains a governed mutation surface and should continue receiving focused review whenever its request payload or route helper changes.
- Future UI mutation surfaces should get similarly scoped static checks instead of relying only on global text scans.

## Verification Evidence

- `pnpm audit:no-live-automation`
- `pnpm nx run dashboard:test --skip-nx-cache`


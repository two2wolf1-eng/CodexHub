# M32 Production Recovery Guided Hardening Review

## Scope

Reviewed Dashboard mutation boundaries, Supervisor recovery approval semantics, static audit coverage, and metadata-only output for the M31 guided operation.

## Hardening Coverage

- Dashboard mutation is limited to existing approval decision UI and production recovery routes.
- Recovery wizard payloads are ids/hashes/statuses only and exclude request-body authority, child artifacts, child auto-approval flags, and free-form reason text.
- Dashboard recovery POST routing is exact-allowlisted to the existing dry-run, approval-request, manual-approval, and run endpoints.
- Supervisor tests cover missing key, malicious origin, stale template hash, forged authority, forged child artifacts, approval mismatch, child approval wait, and remote template waiting behavior.
- Static audit negative fixtures cover browser persistence and forbidden recovery payloads.
- No live boundary allowlist entry was added.

## Residual Risk

Future UX iterations could accidentally expand the Dashboard mutation surface. Keep static route/payload tests close to the wizard and require full governance gates before any UI mutation changes.

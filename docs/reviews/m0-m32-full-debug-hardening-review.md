# M0-M32 Full Debug Hardening Review

## Scope

Reviewed the M0-M32 baseline with a critical focus on M31/M32 production recovery guided operation, Supervisor recovery route semantics, Dashboard mutation boundaries, static audit drift, and metadata-only output.

## Findings

1. Dashboard recovery POST routing used a prefix check for `/api/workflows/production/recoveries/*`. This was narrower than arbitrary POST, but it did not match the M31 route-client requirement for exact endpoint allowlisting.
2. Dashboard recovery guided operation accepted a free-form reason and sent it to recovery approval routes. Supervisor stored only a hash, but the Dashboard mutation surface is intended to send only ids, hashes, and fixed metadata.

## Fixes

- Replaced prefix route validation with an exact set of allowed recovery POST endpoints.
- Removed free-form recovery reason state and payloads from the guided operation.
- Added Dashboard regression checks for exact route allowlisting and no raw recovery reason payload.
- Added no-live audit sentinels for prefix-based recovery route guards and raw recovery reason payloads.

## Residual Risk

Future guided-operation UX work can still expand the mutation surface if tests are bypassed. Keep Dashboard mutation changes tied to exact route allowlists, static audit sentinels, and full foundation verification.


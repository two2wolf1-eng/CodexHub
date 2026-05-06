# M31 Production Recovery Guided Operation Review

## Scope

Reviewed the Dashboard `#/workflows` guided recovery operation, existing Supervisor recovery routes, static no-live automation audit coverage, and operator documentation.

## Findings And Fixes

- Added a Dashboard wizard that only targets the existing production recovery control plane.
- Kept the local-control key in page memory only; no browser persistence is used.
- Avoided child auto-approval from the Dashboard. Child approvals remain separate and must be handled by child control planes.
- Added Supervisor regression coverage for forged child artifacts and request-body authority in recovery run requests.
- Extended static audit sentinels for recovery key persistence and forbidden Dashboard recovery payloads.

## Residual Risk

The Dashboard now has a critical but narrow mutation surface. Future changes must keep the route allowlist and payload restrictions intact, especially around child approval isolation and page-memory key handling.


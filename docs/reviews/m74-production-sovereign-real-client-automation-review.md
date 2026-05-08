# M74 Production Sovereign Real Client Automation Review

## Review Scope

Reviewed contracts, `production-real-client-kernel`, store interfaces, SQLite table registration, Supervisor `/api/real-clients/*` routes, project skill defaults, and scaffold registration for the M74 real-client governance layer.

## Findings

- No generic browser, CDP, selector, JavaScript, shell, or operate-any-page execution route was added.
- High-risk production execution is blocked without a store-resolved approval binding and authority ref.
- Break-glass registration requires two approval bindings, an incident reference, and TTL.
- Unknown real-client connection surfaces now return `unknown_real_client_surface`.
- SQLite repositories now have matching table creation, avoiding runtime repository drift.
- Production run boundary booleans are driven by `boundaryReached`; route-level governance records do not claim a browser or process boundary was invoked before an adapter runner is actually called.

## Tests

- Contracts parse valid M74 fixtures and reject forbidden raw endpoint/selector/JS/body/secret fields.
- Kernel tests cover high-risk approval/authority, forbidden request body rejection, break-glass two-approval rules, and E4/E5 evidence policy.
- Store tests cover repository initialization and existing metadata round trips.
- Supervisor tests cover raw body rejection, execution disabled default, authority-required block, governed execution record creation, job creation/show, break-glass denial and success, and unknown surface rejection.

## Residual Risk

The current round establishes the governed control plane and metadata records. Real adapter runners should be attached only in later slices, one surface at a time, with injected tests proving fixed operations and no generic passthrough.

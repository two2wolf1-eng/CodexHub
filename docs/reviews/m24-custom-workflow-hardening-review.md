# M24 Custom Workflow Hardening Review

## Review Scope

Reviewed custom workflow contracts, store repositories, Supervisor routes, workflow coordinator behavior, Dashboard read-only view, CLI read-only commands, and governance configuration.

## Findings And Fixes

- Store repositories persist and retrieve custom workflow dry-runs, approvals, and runs without raw workflow bodies.
- Supervisor POST routes use the existing local-control token and trusted Origin gate.
- Request-body approval artifacts and execution authority objects are rejected before coordination.
- Run coordination consumes only persisted workflow approval records and child record hashes.
- Dashboard and CLI views issue read-only requests and do not call adapters.

## Residual Risk

Custom workflows can make long chains easier to request. This is intentionally balanced by two approval layers: the custom workflow approval and each child capability approval.

## Release Decision

M24 is suitable as a governed custom workflow foundation. It does not add new execution providers and does not weaken existing child capability gates.


# M75 Codex Desktop Account-Capacity Orchestration Review

## Review Scope

Reviewed M75 contracts, kernel, store registration, Supervisor routes, Dashboard view registration, and scaffold docs.

## Findings

- No generic CDP passthrough, arbitrary selector execution, arbitrary JavaScript execution, or operate-any-page route is introduced.
- Supervisor POST routes inherit local-control token and trusted Origin checks, then reject caller-supplied endpoint, selector, script, authority, credential, raw body, raw DOM, and raw prompt material.
- Task dispatch records store input references, hashes, counts, statuses, evidence ids, and audit ids only.
- Workspace member add/remove is separated from task routing and blocked unless delegated-admin authority and anti-evasion checks pass.
- Claude Code repair runs are constrained to development repair proposals and controlled worktrees; they cannot switch accounts, manage members, or call production clients.

## Residual Risk

The round adds governed control-plane and metadata projections, not a live adapter executor. Later live adapter work must continue to bind every operation to M74 registered surfaces/manifests, dry-run, approval, store-resolved authority, evidence, and audit.

# M29 Production Workflow Recovery Results

## Scope

M29 adds the local production workflow recovery foundation for `local-patch-review`.
It introduces metadata-only recovery contracts, store records, a Supervisor-gated
recovery control plane, child action state projection, CLI read-only commands, and
Dashboard read-only recovery status.

## Result

- Recovery dry-runs, approvals, runs, and child action states are persisted.
- Recovery can model child dry-run and child approval request creation.
- Recovery never auto-approves child actions.
- Recovery does not call child adapters directly.
- Workflow approval remains separate from child approval.
- Public output is ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.

## Verification Evidence

- `pnpm nx run-many --target=test "--projects=contracts,workflow-kernel,store-sqlite,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`

## Residual Risk

The recovery coordinator is still a governed coordinator, not a full production
automation switch. Child control planes must remain independently enabled and
approved before child execution can proceed.


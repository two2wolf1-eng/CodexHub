# M35 Local Production Child Record Binding Review

## Scope

Reviewed the local production workflow recovery path for `local-patch-review`, focusing on child record authority, request-body trust, metadata-only storage, and child approval isolation.

Touched areas:

- `packages/contracts`
- `packages/store-core`
- `packages/store-sqlite`
- `packages/workflow-kernel`
- `apps/supervisor`
- `apps/cli`
- `apps/dashboard`
- Governance docs and scaffold health

## Findings

- The recovery run path now treats request-body child status as untrusted and rejects legacy child state fields.
- Local child actions are resolved from persisted records by id/hash before the coordinator starts.
- Codex patch and Nx verification gained minimal metadata-only child records so the local pilot can be store-resolved end to end.
- Workflow approval remains separate from child approvals; child execution authority is not inferred from workflow approval.

## Residual Risk

- M35 is not a real local execution smoke. It proves store-resolved binding and governance semantics using persisted metadata and injected fixtures.
- Real local production pilot smoke should remain a separate gated round because it touches existing child boundaries.
- The new Codex patch and Nx child record repositories are intentionally minimal; future expansion should keep raw prompt, output, diff, path, env, and body fields out of public records.

## Closeout Checklist

- Contracts reject forbidden raw fields.
- SQLite save/list/get for new child records remains metadata-only.
- Supervisor rejects body authority, full artifacts, and legacy child state fields.
- Pre-coordinator child resolution blocks do not consume workflow approval.
- Dashboard/CLI stay within existing mutation boundaries.

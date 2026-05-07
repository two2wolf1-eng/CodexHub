# M48-D9 Store Round-Trip Fuzz Review

## Review Scope

- `packages/store-sqlite/src/runtime-external-agent-store.test.ts`
- D9 scaffold and orchestration registration

## Findings

No SQLite repository implementation defect was found. Existing save/list behavior already preserved metadata-only records; D9 added direct get-path assertions to make future drift harder to miss.

## Controls Confirmed

- Runtime queue, lease, lock, checkpoint, and job run records survive list/get round-trip without raw input leakage.
- External-agent dry-run, approval, run, and patch summary records survive list/get round-trip without raw prompt, command, diff, patch, path, or token leakage.
- Boundary and control flags remain true to source records: runtime runs stay non-boundary, external-agent runs remain controlled sibling worktree only, and repo-root mutation remains false.

## Residual Risk

D9 does not exercise Supervisor request rejection or approval consumption. Those are covered by the next Supervisor-focused rounds.

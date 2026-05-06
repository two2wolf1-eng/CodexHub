# M45 Controlled Write Expansion Operator Runbook

## Preconditions

- Browser actions require `CODEXHUB_BROWSER_ACT_ENABLED=true`.
- Electron main inspector requires `CODEXHUB_ELECTRON_MAIN_INSPECTOR_ENABLED=true`.
- MCP write tools require both `CODEXHUB_MCP_WRITE_TOOLS_ENABLED=true` and `CODEXHUB_MCP_WORKSPACE_MUTATION_ENABLED=true`.
- CLI mutation commands read the local-control token only from `CODEXHUB_SUPERVISOR_LOCAL_TOKEN`.

## Operator Flow

1. Create a dry-run for the selected controlled-write surface.
2. Review ids, hashes, action kind, target summaries, blocker summaries, evidence refs, and audit ids.
3. Request approval through the exact surface-specific approval request command.
4. Use the existing approval decision path to approve or deny the request.
5. Start the run only after the persisted approval is approved, unused, and hash-bound.

## Safety Notes

- Browser typed text is transient and never persisted.
- Electron source must come from a named snippet id/hash; request-body JavaScript source is rejected.
- MCP patch input is transient, hash-bound, and limited to a controlled sibling worktree.
- Dashboard does not provide M45 execution buttons.


# M11 Production Pilot Narrow Path Runbook

## Purpose

M11a is the first real but narrow local pilot chain:

1. Operator readiness check.
2. Store-resolved worktree dry-run and approval.
3. Controlled worktree creation under sibling `../CodexHub-worktrees`.
4. Codex read-only dry-run.
5. Nx affected verification.
6. Evidence, audit, and governance projection.

The pilot does not generate a patch, push, open a pull request, connect a browser, connect Electron/CDP, call MCP tools, or create a real PR.

## Enablement Checklist

- `CODEXHUB_M11_PRODUCTION_PILOT_ENABLED=true` is set only for the local pilot session.
- `CODEXHUB_WORKTREE_MANAGER_ENABLED=true` is set only when the controlled worktree boundary is intended.
- Supervisor local-control key is configured for mutating Supervisor requests.
- The worktree dry-run exists in the Supervisor store.
- The worktree approval artifact is persisted, approved, unused, unexpired, and store-resolved.
- Runtime paths and refs hash-match the persisted dry-run.
- Codex remains read-only dry-run only.
- Nx targets remain limited to `lint`, `test`, and `build`.

## Operator Flow

1. Run the readiness view:

   ```bash
   codexhub pilot m11 readiness --json
   ```

2. Review existing M11 pilot runs:

   ```bash
   codexhub pilot m11 runs list --json
   ```

3. If a run exists, inspect it:

   ```bash
   codexhub pilot m11 runs show <runId> --json
   ```

4. Create or approve required worktree records only through existing Supervisor-gated worktree control-plane routes or the governed approval UX. Do not pass approval artifacts or execution authority objects in request bodies.

5. Start the M11 pilot only through the Supervisor gated route:

   ```text
   POST /api/pilots/m11/local-runs
   ```

The Dashboard `#/pilot` page is read-only. It displays M11 status, failure classification, PR draft state, and boundary booleans, but it cannot execute or approve the pilot.

## Expected Outcomes

- Success path: `status=passed`, `prDraftStatus=not_ready_no_patch`, `changedFileCount=0`.
- Blocked path: `status=blocked`, `prDraftStatus=blocked`, boundary booleans remain false when blocked before execution.
- Failure path: `status=failed` or `aborted`, failure classification identifies worktree, Codex, Nx, or projection failure.

## Rollback

- Disable `CODEXHUB_M11_PRODUCTION_PILOT_ENABLED`.
- Disable `CODEXHUB_WORKTREE_MANAGER_ENABLED` if no worktree operations should run.
- Use the existing governed worktree cleanup flow for cleanup-required runs.
- Do not manually delete worktrees unless an operator has independently verified the path and repository state.

## Safety Notes

- Request-body approval artifacts and execution authorities are untrusted.
- Raw prompt, stdout, stderr, diff, path, token, cookie, session, and body content must not be stored in public responses.
- Capability providers are not authority providers. The pilot must remain governed by CodexHub policy, approval, evidence, and audit.

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

M11b adds a read-only operator enablement projection for these checks. It is available through
the Dashboard `#/pilot` page and `codexhub pilot m11 readiness --json`. The projection can show
required env flags, blocker codes, latest run status, cleanup handoff metadata, and next actions,
but it cannot approve or execute the pilot.

M11c adds a read-only recovery projection for failed or cleanup-required runs. The projection
maps the failure classification to a recovery action and shows the governed cleanup handoff
state. It uses existing M11 GET metadata only and does not create cleanup dry-runs, approvals,
or runs.

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

4. Resolve blocker codes from the M11 safe-enable checklist:

   - `m11_pilot_env_flag_missing`: set the M11 flag only for the pilot session.
   - `worktree_manager_env_flag_missing`: enable the existing worktree manager boundary only when a worktree run is intended.
   - `worktree_approval_missing_for_m11_pilot`: create and approve the worktree approval through the governed approval UX.
   - `cleanup_handoff_requires_operator_review`: inspect worktree cleanup metadata before another pilot attempt.

5. Create or approve required worktree records only through existing Supervisor-gated worktree control-plane routes or the governed approval UX. Do not pass approval artifacts or execution authority objects in request bodies.

6. Start the M11 pilot only through the Supervisor gated route:

   ```text
   POST /api/pilots/m11/local-runs
   ```

The Dashboard `#/pilot` page is read-only. It displays M11 status, failure classification, PR draft state, and boundary booleans, but it cannot execute or approve the pilot.

## Disablement

- Remove `CODEXHUB_M11_PRODUCTION_PILOT_ENABLED` after the pilot session.
- Remove `CODEXHUB_WORKTREE_MANAGER_ENABLED` when no controlled worktree run should cross the git boundary.
- Keep Dashboard and CLI pilot views usable after disablement; they will show blocked or degraded metadata instead of executing anything.

## Failure Handling

- `readiness_blocked`: resolve doctor, env, store, or audit blockers before a new attempt.
- `approval_blocked`: create or approve the required persisted approval record; do not pass an approval artifact in the run body.
- `worktree_boundary_failed`: inspect git boundary truth and cleanup handoff metadata.
- `codex_failed` or `codex_aborted`: leave PR status blocked or `not_ready_no_patch`; no patch should exist.
- `nx_failed` or `nx_aborted`: inspect verification metadata; do not mark PR ready.
- `projection_degraded`: keep evidence and audit ids, then inspect the degraded projection source.

M11c recovery actions are:

- `resolve_readiness`: fix readiness blockers before another attempt.
- `request_worktree_approval`: use the governed approval UX or existing worktree control plane.
- `inspect_worktree_boundary`: review boundary booleans, evidence ids, and cleanup handoff.
- `review_codex_dry_run`: inspect Codex read-only dry-run status and evidence ids.
- `review_nx_verification`: inspect verification status and evidence ids.
- `inspect_projection_source`: review degraded projection source metadata.
- `review_cleanup_handoff`: use the governed cleanup control plane when cleanup is required.

The cleanup handoff remains metadata-only: ids, hashes, statuses, counts, evidence ids, and audit ids.
It does not delete a worktree and does not grant approval.

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

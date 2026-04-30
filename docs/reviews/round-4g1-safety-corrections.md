# Round 4G.1 Safety Corrections

## Status

Correction outcome: `no_code_correction_applied_release_blocker_recorded`

Round 4G.1 applies no code correction. The 4F.3 retry fixed the prior
`config_disabled` blocker, but the authoritative attempt remained blocked
before the process boundary. That remaining issue is not a docs-only warning
problem, a wording issue, or an audit allowlist drift.

This round is review-only. It does not run another pilot, invoke the adapter
attempt path, create or consume approvals, enable config, change Dashboard,
modify contracts, modify kernel code, modify Supervisor code, modify CLI code,
modify store code, or modify tooling.

## Why No Code Correction Was Applied

The 4F.3 readback shows:

- status: `blocked`
- authoritative: `true`
- supervisorBacked: `true`
- persisted: `true`
- degraded: `false`
- notPersisted: `false`
- configLoadStatus: `loaded`
- processBoundaryInvoked: `false`
- outputHashCount: `0`
- evidenceRefCount: `1`
- auditEventCount: `2`

The known config-authority issue did not recur. The remaining blocker is that
the attempt still stopped before the approved process boundary and therefore
did not produce completed adapter-attempt post-run verification metadata.

Changing warning text or review wording would not close that blocker. A scoped
Round 4F.4 remediation should inspect the exact pre-boundary guard result and
fix only the remaining source or guard mismatch if it is safe to do so.

## Required Future Correction

Round 4F.4 should:

1. Read the 4F.3 attempt, preflight, result, evidence, audit, and timeline
   metadata.
2. Identify the exact guard or source condition that produced `blocked` after
   config loaded.
3. Add focused tests for that blocked reason and for the expected safe next
   state.
4. Fix only the minimum guard/source mismatch needed to reach the approved
   boundary when all prerequisites are valid.
5. Preserve default-disabled behavior, explicit config enablement,
   read-only-only sandbox enforcement, approval/hash binding, isolated clean
   worktree requirements, metadata-only evidence, audit sequence, and
   post-run verification.
6. Re-run pilot prerequisite readiness before any future single pilot retry.

Round 4F.4 must stop if the fix would require Dashboard triggering,
`workspace_write`, `danger_full_access`, raw body persistence, fallback
authority, process-boundary expansion, approval bypass, hash-binding bypass, or
dirty-worktree allowance.

## Non-Corrections

Round 4G.1 intentionally does not:

- broaden the adapter scope
- add a Dashboard trigger
- add run/start/live/execute/approve-and-run controls
- allow `workspace_write`
- allow `danger_full_access`
- enter browser/CDP/Profile/Workspace/account automation
- persist raw prompt, command, stdout, stderr, argv, executable, env plan,
  agent message, reasoning, or raw absolute worktree path bodies
- change approval artifacts
- enable config
- run another pilot
- invoke the adapter attempt path
- approve MVP use
- approve broader autonomous use

## Release Gate Impact

Round 4H.2 remains blocked. A blocked authoritative attempt is useful safety
evidence, but it is not a completed controlled local MVP run.

Round 4H.2 should not be retried until a later round either:

- completes Round 4F.4 and a successful enough Round 4F.5 retry, followed by
  Round 4G.2 review; or
- explicitly records a separate governance decision that accepts the
  pre-boundary blocked result as sufficient for a narrower release gate.

The current 4G.1 decision does not provide that acceptance.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Config blocker recurrence | 4F.3 attempt readback | `configLoadStatus=loaded`; `config_disabled` not found | No config correction in 4G.1 |
| Attempt authority | 4F.3 attempt readback | Authoritative, Supervisor-backed, persisted, non-degraded | Treat as reviewable evidence |
| Remaining blocker | 4F.3 attempt and timeline readback | `processBoundaryInvoked=false`; no completed post-run verification metadata | Release blocker |
| Safety breach check | 4F.3 attempt readback | Metadata-only flags preserved; no raw body flags enabled | No emergency correction |
| Dashboard scope | Round 4G.1 scope | Dashboard untouched | Continue |
| Correction scope | Round 4G.1 review | Remaining blocker needs 4F.4 diagnosis, not docs-only correction | Stop after docs commit |

## Recommendation

Proceed next to Round 4F.4: Next Pilot Blocker Remediation.

Do not enter Round 4H.2 until a later pilot retry and review provide evidence
that is sufficient for an MVP gate retry.

Dashboard trigger remains forbidden. `workspace_write` remains forbidden.
`danger_full_access` remains forbidden. Browser/CDP/Profile/Workspace/account
automation remains forbidden. Broader autonomous use remains forbidden unless a
future governance round explicitly approves it.

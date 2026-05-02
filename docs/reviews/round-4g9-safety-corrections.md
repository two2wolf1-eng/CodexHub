# Round 4G.9 Safety Corrections

## Round

Round 4G.9: Safety Corrections Assessment.

## Scope

This is a docs-only safety assessment for the 4F.19 failed boundary-invoked retry. No code correction is applied in 4G.9.

## Decision

No code correction was made.

Reason:

- The 4F.19 result is authoritative, Supervisor-backed, persisted, non-degraded, and not fallback authority.
- The attempt preflight passed and the approved process boundary was invoked.
- The failure is not a docs-only warning issue.
- The current blocker is process startup failure: `process_start_failed`.
- Fixing that requires a future implementation round focused on executable resolution, argv construction, working directory, Windows spawn behavior, and safe environment allowlisting.

## Safety Assessment

4G.9 found no evidence that the safety boundaries were widened:

- No Dashboard trigger was added.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw local worktree path persistence remain forbidden.
- Fallback/degraded output was not treated as authority.
- The process boundary remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.

## Release Blocker

Release blocker: `process_start_failed`

This is a process-boundary startup blocker. It is not approval/config/worktree/policy readiness. A future remediation must not bypass the failure or treat the failed attempt as MVP success.

## Recommended Follow-up

Recommended next round: `Round 4F.20: Process Start Failure Remediation`.

4F.20 should diagnose and fix only the startup failure class. It should inspect:

- executable resolution
- argv builder output
- binary availability in the current environment
- runtime working directory
- Windows `shell: false` spawn compatibility
- safe environment allowlist requirements
- process-start error classification

4F.20 must not run a pilot, add Dashboard trigger, allow `workspace_write`, allow `danger_full_access`, persist raw stdout/stderr, relax the process-boundary audit, or approve broader autonomous use.

4H.6 remains blocked until a later controlled retry completes and is reviewed without a release blocker.

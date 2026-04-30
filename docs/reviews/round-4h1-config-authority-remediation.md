# Round 4H.1: Config Authority Alignment Remediation

## Status

Outcome: config_authority_aligned

Round 4H.1 remediates the Round 4H No-Go finding where pilot prerequisite readiness recorded config enablement, but the actual real read-only adapter attempt path returned `config_disabled`.

This round did not run a pilot, did not invoke a real adapter process boundary, did not add a Dashboard trigger, and did not approve MVP use.

## Source Findings

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Tracked config state | `.codexhub/codex-exec.yaml` | `liveEnabled: true`; `allowedSandboxModes: [read_only]`; `workspace_write` and `danger_full_access` forbidden | Use as authoritative local config source |
| Readiness/source-prep config source | `apps/supervisor/src/server.ts` pilot prerequisite paths | These paths inspect `getLiveConfigLoadResult()` and `config.liveEnabled` | Keep unchanged |
| Attempt config source before 4H.1 | `apps/supervisor/src/server.ts` attempt path | Attempt path constructed default disabled adapter config directly | Root cause for `config_disabled` |
| Kernel config default | `packages/codex-kernel/src/real-read-only-adapter.ts` | Default config remains disabled and safe | Preserve fail-closed default |

## Remediation

Added a pure kernel config-authority mapper that converts loaded Codex exec config into real read-only adapter config:

- `liveEnabled=true`
- `allowedSandboxModes` exactly `read_only`
- `workspace_write` and `danger_full_access` explicitly forbidden

Only that combination maps to `configuredEnabled=true` and `status=enabled`. Missing, disabled, or widened config remains disabled.

The Supervisor attempt endpoint now uses the same loaded config source as pilot source-prep and prerequisite readiness. With enabled config, the attempt preflight no longer fails the explicit config gate or returns `config_disabled`; it still records a blocked/deferred outcome until the controlled pilot path is invoked by a later round.

## Verification Evidence

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Kernel config mapper | `pnpm nx test codex-kernel` | 73 tests passed | Config mapping accepted |
| Supervisor attempt consistency | `pnpm nx test supervisor` | 7 tests passed | Attempt path uses loaded config authority |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Boundary remains isolated to the approved module |

## Safety Boundary Confirmation

- `pilotExecuted=false`
- `adapterAttemptInvoked=false` for this remediation round
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- no Dashboard trigger added
- no raw prompt, command, stdout, stderr, argv, executable path, env plan, or raw worktree path persistence added
- no process boundary module expansion

## Next Recommendation

Round 4F.3 may be considered only after this round passes full verification and is committed cleanly.

Round 4F.3 must perform at most one controlled CLI-only read-only pilot retry, and it must stop if `config_disabled` appears again.

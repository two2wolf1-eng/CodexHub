# M9 Local Pilot Results

## Summary

M9 validated the first local pilot path on top of the M0-M8 release candidate baseline. The pilot remains conservative: it does not push, open pull requests, connect real accounts, add Browser/Electron/MCP execution, or bypass policy, approval, evidence, and audit gates.

## Delivered Slices

- M9a `5c70b45 Add M9 local pilot control loop`: added the local pilot runner and Supervisor read/control routes for a fixed worktree -> Codex dry-run -> Nx verification -> governance projection chain.
- M9b `f9f2ce6 Add governed approval UX`: added the approval inbox projection, Supervisor decision route, Dashboard `#/approvals`, and CLI approval inbox/decision commands.
- M9c hardening: adds failure-path regression coverage, audit guards for approval token persistence and direct adapter execution, and this release evidence.

## Capability Results

| Capability | M9 State | Boundary |
| --- | --- | --- |
| Worktree | Pilot reuses governed worktree flow | Existing controlled git boundary only |
| Codex | Pilot task is dry-run/read-only only | Existing Codex boundary only |
| Nx | Pilot reuses governed verification | Existing Nx boundary only |
| Approval UX | Human decision entry added | Supervisor route only |
| Dashboard | Approval inbox view added | Session-memory token only |
| CLI | Approval inbox/decision commands added | Token from environment only |

## Safety Results

- Request-body approval artifacts and execution authority objects remain untrusted.
- Approval decisions resolve persisted records from the server-side store.
- Dashboard local-control token handling is memory-only and must not use browser storage.
- CLI approval decisions do not accept a token argument.
- Pilot outputs remain metadata-only: ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- PR draft status remains not ready for Codex dry-run-only pilot paths.

## Residual Risk

- M9a can touch existing governed live boundaries when all flags, approvals, and hash-bound inputs are valid. Operators should keep product defaults disabled unless actively piloting.
- Approval UX is intentionally minimal and does not include multi-approval, delegation, or long-lived operator sessions.
- M10 should focus on tighter operator workflows and release packaging rather than broadening execution surfaces.

## M10 Recommendations

- Add read-only operator history for approval decisions.
- Add explicit pilot runbook steps for enabling and disabling local pilot flags.
- Keep PR creation, push, Browser act, Electron main inspector, and MCP write tools out of scope until separate approval-gated milestones.

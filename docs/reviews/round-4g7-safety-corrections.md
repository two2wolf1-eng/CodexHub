# Round 4G.7 Safety Corrections

## Scope

Round 4G.7 is docs-only. No code correction was applied.

## Review Decision

No small safety correction was appropriate in this round. The remaining issue is not a warning-text issue, audit allowlist issue, or docs-only gap. The remaining blocker is a boundary-invoked failed attempt whose persisted readback still lacks complete metadata-only diagnostics and whose post-run verification was skipped.

## Corrections Applied

- Contracts: no change.
- `codex-kernel`: no change.
- Supervisor: no change.
- CLI: no change.
- Store: no change.
- Dashboard: no change.
- Config: no change.
- Approval state: no change.
- Runtime pilot worktree: no change.

## Why No Code Change Was Made

4G.7 is a review round. Applying code changes during the review would mix release assessment with remediation and obscure the 4F.15 evidence state.

The correct next remediation is a separate 4F.16 round that uses fake-runner or metadata-only tests to prove where diagnostics are lost before another controlled retry is allowed.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Hard boundary issue | 4F.15 review and 4G.7 inspection | No Dashboard trigger, workspace write, danger full access, raw body, or raw path persistence issue found | No emergency fix required |
| Boundary execution | 4F.15 attempt readback | `processBoundaryInvoked=true`, `resultStatus=failed` | Requires future remediation |
| Diagnostics | 4F.15 readback scan | Boundary failure code, exit code, signal, timeout/cancel, duration, stdout/stderr hash/count fields, and skip reason are missing at persisted readback | Requires future remediation |
| Post-run verification | 4F.15 attempt readback | `postRunVerificationStatus=skipped` | Release blocker remains |
| MVP eligibility | 4G.7 pilot review | Failed attempt and skipped post-run verification cannot support local MVP approval | 4H.5 remains blocked for Go |

## Recommended Next Work

Recommended next remediation:

`Round 4F.16: Boundary Diagnostics Readback Alignment`

That round should:

- Identify whether diagnostics are lost during attempt construction, persistence, response shaping, CLI formatting, or timeline aggregation.
- Ensure persisted attempt/latest/list/timeline readback includes metadata-only boundary diagnostics for failed and aborted boundary results.
- Preserve raw stdout/stderr body redaction.
- Keep process launch isolated to the approved module.
- Use fake-runner or metadata-only tests before any further controlled retry.
- Avoid Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace automation, account automation, and broader autonomous use.

## Safety Boundary Confirmation

- No pilot retry was run in 4G.7.
- No adapter attempt path was invoked in 4G.7.
- No approval was created, renewed, revoked, consumed, or marked used.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.

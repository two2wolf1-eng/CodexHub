# Round 4H MVP Release Decision

## Status

Recorded

## Decision

Outcome: `no_go_for_mvp`

The read-only adapter MVP is not conditionally approved for controlled local
MVP use.

## Context

Round 4F.2 produced an authoritative, Supervisor-backed, persisted pilot retry
attempt:

- attemptId:
  `codex_real_read_only_adapter_attempt_f2af1ef3-b40a-4d71-980d-b0def989d95f`
- status: `blocked`
- errorCode: `config_disabled`
- evidence refs present: yes
- audit refs present: yes
- timeline entry present: yes
- fallback used as authority: no
- process boundary invoked: no

Round 4G reviewed the result and found no hard safety breach, but it recorded
two release blockers:

1. The attempt preflight blocked with `config_disabled` even though the latest
   prerequisite source reported `configExplicitlyEnabled=true`.
2. The timeline had no completed adapter-attempt post-run verification metadata
   because the attempt stopped before the process boundary.

## Rationale

The blocked result is useful safety evidence. It proves that the attempt path
failed closed and produced authoritative evidence, audit, and timeline records.

It does not prove MVP readiness. The release gate needs a controlled pilot
result that demonstrates the approved path through runtime gates and records
post-attempt verification metadata. A pre-boundary `config_disabled` block does
not satisfy that bar.

The conservative decision is therefore `no_go_for_mvp`.

## Non-Approval

This decision does not approve:

- controlled local MVP use
- broader autonomous use
- Dashboard trigger
- Dashboard run, start, live, execute, or approve-and-run controls
- `workspace_write`
- `danger_full_access`
- browser/CDP automation
- Electron/CDP automation
- Chrome Profile or ChatGPT Workspace automation
- account, token, cookie, session, or MFA automation
- raw prompt, command, stdout, stderr, agent message, reasoning, or raw local
  worktree path persistence

## Required Before Reconsideration

Before a future MVP gate can reconsider conditional local MVP use, a later
governance round must:

1. Resolve the config handoff mismatch between prerequisite readiness and the
   attempt preflight.
2. Preserve default-disabled behavior and explicit config enablement.
3. Preserve read-only-only sandbox enforcement.
4. Preserve approval, dry-run hash, and policy hash binding.
5. Preserve isolated clean worktree requirements.
6. Preserve metadata/hash-only evidence and audit behavior.
7. Produce one new authoritative pilot retry result.
8. Record post-attempt verification metadata if the attempt reaches the
   boundary path.
9. Re-run the pilot review before another MVP release gate.

## Consequences

- Round 4H stops with `no_go_for_mvp`.
- Round 5A or broader autonomous use must not begin from this decision.
- The existing implementation and governance records remain available for a
  future correction and retry path.
- Dashboard trigger, `workspace_write`, and `danger_full_access` remain
  forbidden.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Pilot attempt | Round 4F.2 report | Authoritative `blocked` attempt | Not MVP success |
| Safety review | Round 4G review | No hard safety breach found | Continue to conservative decision |
| Config handoff | Round 4G review | `config_disabled` despite source readiness | No-Go |
| Verification metadata | Round 4G review | No completed attempt verification metadata | No-Go |
| Boundary status | Real adapter boundary audit | Approved module isolation passed | Preserve |
| Release outcome | Round 4H decision | Release blockers remain | `no_go_for_mvp` |

## Final Statement

Round 4H does not approve local MVP use. It does not approve broader
autonomous use. It does not approve Dashboard triggering, `workspace_write`,
`danger_full_access`, browser/CDP/Profile/Workspace/account automation, or any
raw body persistence.

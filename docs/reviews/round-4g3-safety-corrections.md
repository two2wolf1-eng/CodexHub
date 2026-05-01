# Round 4G.3 Safety Corrections

## Status

Round 4G.3 applied no code correction.

The Round 4F.7 blocker is not a docs-only wording issue, CLI warning issue, or
audit allowlist issue. It is a real pre-boundary guard failure:
`isolated_worktree_clean` failed and the attempt returned
`worktree_not_isolated`.

## Safety Assessment

No corrective code change is made in this round because changing worktree
isolation recognition requires a dedicated remediation round with focused
contracts or kernel/Supervisor tests, depending on where the source alignment
gap is found.

The current fail-closed behavior is correct:

- A worktree that is not recognized as isolated and clean blocks the attempt
  before process boundary invocation.
- No fallback output is treated as authoritative.
- No raw prompt, command, stdout, stderr, argv, executable path, env plan, raw
  worktree path, agent message body, or reasoning body is persisted.
- Evidence, audit, and timeline records remain metadata/hash-only.
- Dashboard trigger, `workspace_write`, and `danger_full_access` remain
  forbidden.

## Required Future Correction

A future remediation round should diagnose and align the worktree isolation
source used by the attempt preflight:

- Confirm the sanitized worktree label, status, and path hash from source
  preparation are available to the actual attempt preflight.
- Confirm the runtime path hash comparison uses the same normalization rules as
  source preparation.
- Confirm the guard distinguishes raw runtime input from persisted metadata and
  never stores the raw absolute path.
- Add focused tests for hash match, hash mismatch, dirty worktree, missing
  source metadata, and fallback authority rejection.
- Use fake-runner paths only for tests; do not run another pilot in the
  remediation round.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Code correction needed in 4G.3 | 4F.7 attempt review | No docs-only correction can resolve worktree isolation recognition | Defer to future remediation |
| Fail-closed behavior | 4F.7 attempt readback | Blocked before boundary | Keep |
| Raw body/path safety | 4F.7 attempt/timeline readback | Metadata-only summaries | Keep |
| Dashboard boundary | No Dashboard files changed | No trigger introduced | Keep |
| Release readiness | 4F.7 result | No boundary invocation or completed post-run verification | MVP Go blocked |

## Decision

No code correction was applied in Round 4G.3.

Round 4H.2 can be considered only as a conservative No-Go release gate for the
current evidence chain. A future worktree isolation source alignment round is
required before another pilot retry can provide MVP-supporting evidence.

# Round 4G.2 Safety Corrections

## Status

Round 4G.2 applied no code correction.

The 4F.5 blocker is not a docs-only wording issue, CLI warning issue, or audit
allowlist issue. It is a real policy-source alignment blocker:
`policy_decision_exists` failed because the policy decision supplied to the
attempt preflight was denied.

## Safety Assessment

No corrective code change is made in this round because changing the policy
source requires a dedicated remediation round with focused contracts, kernel,
store, Supervisor, CLI, and test updates.

The current fail-closed behavior is correct:

- A denied policy decision blocks the attempt before process boundary
  invocation.
- No fallback output is treated as authoritative.
- No raw prompt, command, stdout, stderr, argv, executable path, env plan, raw
  worktree path, agent message body, or reasoning body is persisted.
- Evidence, audit, and timeline records remain metadata/hash-only.
- Dashboard trigger, `workspace_write`, and `danger_full_access` remain
  forbidden.

## Required Future Correction

Round 4F.6 should align a current read-only adapter pilot policy source:

- Evaluate a current metadata-only policy source from existing dry-run metadata
  plus current config.
- Persist the source as authoritative only through Supervisor-backed storage.
- Bind later approval artifacts to that aligned policy source hash.
- Make the attempt preflight prefer the aligned source while failing closed for
  missing, degraded, denied, or mismatched policy sources.
- Preserve the historical dry-run policy decision unchanged.
- Use tests and fake-runner paths only; do not run a real pilot in 4F.6.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Code correction needed in 4G.2 | 4F.5 attempt review | No docs-only correction can resolve denied policy source | Defer to 4F.6 |
| Fail-closed behavior | 4F.5 attempt readback | Blocked before boundary | Keep |
| Raw body/path safety | 4F.5 attempt/timeline readback | Metadata-only summaries | Keep |
| Dashboard boundary | No Dashboard files changed | No trigger introduced | Keep |
| Release readiness | 4F.5 result | No completed boundary run or post-run verification | 4H.2 blocked |

## Decision

No code correction was applied in Round 4G.2.

Round 4F.6 is required before another pilot retry can be considered.

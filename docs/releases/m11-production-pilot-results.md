# M11 Production Pilot Results

## Summary

M11 moved the operator-ready baseline into a narrow production-pilot product slice:

- M11a added the governed narrow-path pilot route and kernel model.
- M11b added read-only operator enablement and run summaries.
- M11c added failure recovery and cleanup handoff projections.
- M11d added fixture-only acceptance smoke scenarios.
- M11.5 hardens and audits the M11 chain before M12 starts.

The pilot remains intentionally narrow. Codex is read-only/dry-run only, worktrees stay under the
sibling `../CodexHub-worktrees` root, and PR draft status is limited to `not_ready_no_patch` or
`blocked`.

## Capability Matrix

| Capability | State | Boundary | Approval | Output |
| --- | --- | --- | --- | --- |
| Readiness / doctor | Read-only | None | Not required | ids, counts, statuses, summaries |
| Worktree create | Existing controlled git boundary | Reused, not widened | Persisted approval required | hashes, changed-file counts, evidence ids, audit ids |
| Codex | Read-only dry-run | Existing Codex boundary | Existing gate only | hashes, status, evidence ids, audit ids |
| Nx verification | Existing affected verification boundary | Reused, not widened | Existing gate only | target/status/count summaries |
| Governance projection | Read-only | None | Not required | run/evidence/audit projections |
| Acceptance smoke | Fixture-only | None | Not required | scenario/status/recovery metadata |

## Safety Results

- No push, open PR, Browser act, Electron main inspector, MCP write tool, or policy backend
  authority transfer was added.
- Dashboard and CLI M11 surfaces remain read-only.
- Request-body approval artifacts and execution authority objects remain untrusted.
- Public pilot output remains metadata-only and excludes raw prompts, stdio, diffs, paths, URLs,
  request bodies, credentials, and local-control keys.
- M11d smoke does not call Supervisor and does not start Git, Codex, or Nx.

## Verification Evidence

M11d and M11.5 release audit evidence:

- Focused M11d tests: contracts, orchestrator-kernel, dashboard, and CLI passed.
- Focused M11d lint/build for changed projects passed.
- `pnpm scaffold:health` passed.
- `pnpm audit:boundaries` passed.
- `pnpm audit:sqlite-isolation` passed.
- `pnpm audit:no-live-automation` passed.
- `pnpm audit:skills` passed.
- `pnpm verify:foundation` passed.
- `git diff --check` reported only line-ending warnings and no whitespace errors.

## Residual Risks

- M11 is still not full production automation because Codex write/patch generation is disabled.
- Real pilot execution depends on correct operator-provided local-control configuration and
  store-resolved approvals.
- Cleanup remains a governed handoff; dirty or unsafe cleanup states stay blocked by existing M6
  cleanup rules.

## M12 Entry Criteria

M12 may begin only with the same conservative assumptions:

- patch generation happens only in an approved isolated worktree,
- failed verification cannot produce PR-ready state,
- raw diff and PR body remain hash-only,
- retry/resume and cleanup are approval-gated.

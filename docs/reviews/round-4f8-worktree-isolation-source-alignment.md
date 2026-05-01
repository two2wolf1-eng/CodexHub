# Round 4F.8 Worktree Isolation Source Alignment Remediation

## Status

Round 4F.8 remediates the worktree hash source mismatch found after Round 4F.7
and reviewed in Round 4G.3 / 4H.2.

Outcome: `worktree_source_alignment_remediated_for_next_retry`

This round does not run a pilot, does not invoke the adapter attempt path, does
not create or consume approvals, does not change Dashboard behavior, and does
not approve MVP use.

## GSD Spec

- Goal: Align the source-preparation and prerequisite worktree hash generation
  with the actual Supervisor attempt preflight hash rule.
- Scope: `packages/codex-kernel` hash helper, Supervisor usage/tests, CLI
  source-preparation/prerequisite hash derivation, focused tests, and this
  review document.
- Non-scope: No pilot retry, no real Codex execution, no approval creation, no
  config mutation, no Dashboard work, no workspace write mode, and no
  danger-full-access mode.
- Acceptance criteria: Focused tests prove source-prep and prerequisite CLI
  commands derive the same sanitized hash used by Supervisor attempt preflight;
  no raw worktree path is sent to source-prep/prerequisite endpoints; audits and
  verification pass.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`,
  browser/CDP/Profile/Workspace/account automation, raw body persistence, raw
  absolute worktree path persistence, and broader autonomous use remain
  forbidden.
- Affected apps/packages: `packages/codex-kernel`, `apps/supervisor`,
  `apps/cli`, and docs.
- Risk level: medium, because this changes prerequisite-source tooling for the
  future real read-only adapter pilot retry.

## GStack Plan

- Plan: Identify where 4F.7 source metadata and attempt runtime hash diverged.
- Build: Add one public hash helper and route CLI source-prep/prerequisite
  hashing through it.
- Review: Keep Supervisor endpoints rejecting raw worktree paths and keep the
  process boundary allowlist unchanged.
- QA: Run focused kernel, Supervisor, CLI, boundary, no-live, and foundation
  checks before full verification.
- Ship: Commit only after verification and clean git status.
- Retro: Recommend one future pilot retry round after this remediation.

## Inspection Findings

The latest persisted 4F.7 pilot source-preparation and prerequisite records are
authoritative and ready, but they contain this sanitized worktree hash:

`sha256:0affb4c5187a9fe16dc3516a77d2ed79b49d6d92dc66aec7e6264d17e124dbf5`

The existing dedicated pilot worktree still exists as a separate detached
worktree at commit `c0fc119f10b1b4ba2597662ab8230fdff8974f8e`. The canonical
hash derived by the same normalization rule used by Supervisor attempt preflight
is:

`sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`

The raw local absolute path is intentionally not recorded here. The mismatch
explains why Round 4F.7 failed `isolated_worktree_clean` even though readiness
metadata said an isolated clean worktree source existed.

## Remediation

4F.8 adds `hashRealReadOnlyAdapterRuntimeWorktreePath` in `codex-kernel` and
uses it from:

- Supervisor attempt preflight runtime path hashing.
- Supervisor tests that construct runtime worktree hashes.
- CLI `pilot-prerequisite-sources prepare`.
- CLI `pilot-prerequisites check`.

The CLI now accepts `--worktree <path>` for source-preparation and prerequisite
check commands only to derive the sanitized path hash locally. It sends only:

- `worktreeLabel`
- `worktreeStatus`
- `worktreePathHash`

It does not send or persist `worktreePath` to those metadata-source endpoints.
If both `--worktree` and `--worktree-path-hash` are present, the derived runtime
hash is used so source metadata is aligned with the later attempt preflight.

## Safety Boundary Confirmation

- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `processAdapterStarted=false`
- `processAdapterApproved=false`
- `implementationApproved=false`
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- `pilotExecuted=false`
- `adapterAttemptInvoked=false`

No Dashboard trigger was added. No `workspace_write` or `danger_full_access`
path was added. No process-boundary module was changed. No raw prompt, command,
stdout, stderr, argv, executable path, env plan, or raw local worktree path is
persisted by this remediation.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Clean start | `git status --short` | Empty output | Continue |
| Skills audit | `pnpm audit:skills` | Passed | Continue |
| No-live audit | `pnpm audit:no-live-automation` | Passed | Continue |
| Boundary audit | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Continue |
| Latest source-prep readback | CLI latest source-prep query | persisted worktree hash differed from canonical runtime hash | Remediate |
| Latest prerequisite readback | CLI latest prerequisite query | `ready_for_pilot_retry`, but same stale hash | Remediate |
| Hash helper | `codex-kernel` focused test | shared helper returns stable `sha256:` hash for equivalent runtime paths | Continue |
| CLI source alignment | CLI focused test | source-prep/prerequisite derive hash from runtime path and do not send raw path | Continue |

## Next Round

Round 4F.9 may be considered as exactly one controlled pilot retry after
refreshing source-preparation and prerequisite records with the CLI-derived
worktree hash.

Round 4F.8 itself does not approve MVP use and does not execute a pilot.

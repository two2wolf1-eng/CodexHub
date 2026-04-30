# Round 4E Read-only Adapter Operator Runbook

## Status

Round 4E is operator guidance only. It does not add a Dashboard trigger, does not
approve broader use, and does not allow `workspace_write` or `danger_full_access`.

The read-only adapter remains CLI-only, explicitly gated, metadata-only, and
operator supervised.

## Required Prerequisites

Before an operator considers a controlled local adapter attempt, all of the
following must be true:

- Round 4B.1 recorded `conditional_go_for_limited_local_use`.
- Round 4D timeline and evidence surfaces are available for read-only review.
- A known existing `dryRunId` is available.
- Explicit adapter configuration is enabled for the local controlled attempt.
- A valid approval artifact exists and is not expired, revoked, used, or mismatched.
- `dryRunPlanHash` matches the approval artifact.
- `policyDecisionHash` matches the approval artifact.
- The sandbox mode is `read_only`.
- `workspace_write` is forbidden.
- `danger_full_access` is forbidden.
- An isolated worktree exists and is clean before the attempt.
- Evidence and audit stores are ready.
- The operator is prepared to review the result, timeline, evidence refs, audit refs,
  workspace mutation status, and post-attempt verification status.

## CLI-Only Flow

Use the CLI only. The Dashboard is read-only and cannot trigger adapter attempts.

1. Review existing attempt records:

   ```powershell
   pnpm codexhub codex exec real-read-only-adapter attempts list --dry-run <dryRunId> --json
   ```

2. Review the attempt timeline:

   ```powershell
   pnpm codexhub codex exec real-read-only-adapter attempts timeline <dryRunId> --include-evidence --include-audit --json
   ```

3. If all prerequisites are satisfied, a future supervised attempt uses the
   existing CLI-only attempt path:

   ```powershell
   pnpm codexhub codex exec real-read-only-adapter attempt <dryRunId> --approval <approvalArtifactId> --worktree <isolatedWorktreePath> --json
   ```

The command must not be retried by default. Any blocked, failed, aborted, or
degraded result requires operator review before the next step.

## State Guide

- `blocked`: gate checks refused the attempt before authority was claimed.
- `completed`: metadata-only authoritative record exists; operator review is still required.
- `failed`: failure metadata exists; operator review is required.
- `aborted`: cancellation or stop metadata exists; operator review is required.
- `degraded`: output is display-only and not authoritative.
- `notPersisted`: output is display-only and cannot be used as source-of-truth evidence.

## Evidence And Audit Expectations

Attempt evidence must remain metadata/hash-only:

- allowed: ids, timestamps, statuses, counts, hashes, summaries, evidence ref ids,
  audit event ids, and verification metadata.
- forbidden: raw prompt body, raw command body, raw stdout body, raw stderr body,
  agent message body, reasoning body, raw argv, executable paths, shell snippets,
  environment plans, and raw worktree paths.

Audit coverage must include before, after, abort, and failure states. The
timeline view is for review only and does not grant permission for broader use.

## Abort And Failure Semantics

Abort before authority is claimed when any prerequisite is missing, mismatched,
degraded, or ambiguous. Treat unexpected workspace mutation as critical. Do not
auto-revert; record the evidence and require manual review.

## Non-Approval Statement

Round 4E does not approve broader autonomous use. Dashboard triggering,
`workspace_write`, `danger_full_access`, browser/CDP/profile automation,
ChatGPT Workspace access, and account/session/token/MFA automation remain
forbidden.

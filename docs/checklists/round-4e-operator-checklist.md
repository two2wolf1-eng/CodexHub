# Round 4E Operator Checklist

## Before Any Controlled Local Attempt

- [ ] Round 4B.1 outcome is `conditional_go_for_limited_local_use`.
- [ ] Round 4D attempt timeline is available for read-only review.
- [ ] `dryRunId` is known and already exists.
- [ ] Explicit adapter configuration is enabled for this controlled local context.
- [ ] Approval artifact exists.
- [ ] Approval artifact is valid.
- [ ] Approval artifact is not expired.
- [ ] Approval artifact is not revoked.
- [ ] Approval artifact is unused.
- [ ] `dryRunPlanHash` matches.
- [ ] `policyDecisionHash` matches.
- [ ] Sandbox mode is `read_only`.
- [ ] `workspace_write` is forbidden.
- [ ] `danger_full_access` is forbidden.
- [ ] Dashboard trigger is unavailable.
- [ ] Isolated worktree exists.
- [ ] Isolated worktree is clean before the attempt.
- [ ] Evidence store is ready.
- [ ] Audit store is ready.
- [ ] Operator is available for manual review.

## During The Attempt

- [ ] Use CLI-only path.
- [ ] Do not use Dashboard controls.
- [ ] Do not retry by default.
- [ ] Record blocked, completed, failed, or aborted status.
- [ ] Persist only metadata/hash summaries and ref ids.
- [ ] Do not persist raw prompt, command, stdout, stderr, agent, or reasoning bodies.
- [ ] Do not persist raw argv, executable path, shell snippet, environment plan, or raw worktree path.

## After The Attempt

- [ ] Review attempt record.
- [ ] Review attempt timeline.
- [ ] Review evidence refs.
- [ ] Review audit refs.
- [ ] Review post-attempt verification status.
- [ ] Review workspace mutation status.
- [ ] Treat unexpected diff as critical.
- [ ] Do not auto-revert unexpected changes.
- [ ] Record operator observations.

## Stop Conditions

- [ ] Missing approval artifact.
- [ ] Expired, revoked, used, or mismatched approval artifact.
- [ ] Missing or mismatched dry-run hash.
- [ ] Missing or mismatched policy hash.
- [ ] Non-`read_only` sandbox.
- [ ] `workspace_write` requested or allowed.
- [ ] `danger_full_access` requested or allowed.
- [ ] Dashboard trigger requested or present.
- [ ] Dirty or unknown worktree state.
- [ ] Degraded evidence or audit store.
- [ ] Blocked, failed, aborted, degraded, or not-persisted result without review.
- [ ] Post-attempt verification failure.
- [ ] Unexpected workspace mutation.

## Non-Approval Statement

This checklist supports controlled local review only. It does not grant broader
use, Dashboard triggering, `workspace_write`, `danger_full_access`, browser/CDP
automation, profile automation, ChatGPT Workspace access, or account/session
automation.

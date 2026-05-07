# M48g E2E GA Rehearsal Runbook

## Purpose

Use Production GA E2E rehearsals to prove the release path can be reasoned about end to end before final GA signoff.

## Procedure

1. Run the fixture `all-pass` scenario.
2. Run blocked or failed scenarios for patch, verification, PR, merge, release, deploy, observe, rollback, child hash mismatch, approval blocked, evidence missing, and audit gap.
3. Confirm completed, blocked, and failed step counts match the expected point of failure.
4. Confirm live smoke is either `completed` in an explicitly configured environment or `readiness_blocked`.
5. Review evidence and audit references before RC signoff.

## Boundaries

- Rehearsal does not execute child adapters.
- GA approval cannot replace child approvals.
- Raw chain payloads and child artifacts are never accepted or displayed.

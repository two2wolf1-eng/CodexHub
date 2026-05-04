# M10 Local Pilot Operator Runbook

## Purpose

M10a turns the M9 local pilot into an operator-facing product entry. It does not add a new execution path. The operator uses the checklist, doctor output, approval inbox, governance projection, and rehearsal summaries to decide whether a later governed pilot can be enabled safely.

## Before Enabling

Run the read-only readiness checks first:

```bash
codexhub doctor
codexhub pilot m10 checklist
codexhub approvals history
codexhub governance runs list
```

The pilot must remain blocked when any of these are missing:

- store availability
- process boundary allowlist audit
- no-live automation audit
- required local-control key configuration
- worktree manager explicit enablement
- persisted approval record
- governance projection evidence for review

The CLI and Dashboard show configured or missing states and hashes only. They must not print token values, raw environment values, raw paths, prompts, command output, diffs, or bodies.

## Approval Flow

The operator reviews approval requests through the governed approval UX. Approval artifacts are resolved by the Supervisor store in execution rounds; request-body approval artifacts are never trusted. M10a does not approve or execute anything from the Dashboard pilot page or the read-only CLI commands. M10b adds approval decision history as a read-only projection over inbox and decision metadata; it does not create or persist approval history records.

## Pilot Rehearsal

The M10 pilot entry summarizes the safe sequence:

1. Run the doctor preflight.
2. Review safe-enable blockers.
3. Review approval inbox metadata.
4. Confirm Codex remains dry-run/read-only for the pilot.
5. Confirm Nx verification stays allowlisted.
6. Review unified governance run, evidence, and audit projections.
7. Keep rollback notes ready before any later live pilot.

Use the fixture-only acceptance rehearsal before any later live pilot:

```bash
codexhub pilot m10 rehearse --fixture
codexhub pilot m10 rehearse --fixture --scenario readiness-blocked
codexhub pilot m10 rehearse --fixture --scenario approval-blocked
codexhub pilot m10 rehearse --fixture --scenario codex-failed
codexhub pilot m10 rehearse --fixture --scenario nx-failed
```

M10c does not run the pilot. It proves the operator flow and failure paths can be reviewed with metadata only. Later pilot execution must still use existing governed Supervisor routes and persisted approvals.

## Failure Handling

If readiness is blocked, do not enable the local pilot. Resolve the named blocker and rerun the read-only checklist. If a later pilot creates a worktree and then fails, use the governed cleanup control plane. Do not delete worktrees manually as a workaround for failed governance.

## Rollback

Rollback is configuration-first:

- disable pilot-related environment flags
- keep PR creation disabled
- keep push disabled
- use governed cleanup metadata for created worktrees
- rerun `codexhub doctor` and governance audits

No raw runtime data is required for rollback.

# M27 Production Workflow Pilot Operator Runbook

## Purpose

Use M27 pilot views to confirm a production workflow template can be safely coordinated from existing child control-plane records.

## Preconditions

- Production templates remain disabled by default.
- Existing child records must already exist for write or remote-write steps.
- Workflow approval and child approvals remain separate.
- No CLI or Dashboard command executes a pilot.

## Read-Only Checks

```bash
codexhub workflows catalog list --json
codexhub workflows catalog readiness local-patch-review --json
codexhub workflows production pilots list --json
codexhub workflows production pilots rehearse --template-id local-patch-review --fixture --scenario all-pass --json
codexhub workflows production pilots rehearse --template-id github-draft-pr-chain --fixture --scenario remote-step-blocked --json
```

## Blocked States

- `custom_workflow_production_execution_disabled`: production execution is intentionally disabled.
- `custom_workflow_approval_missing_or_not_approved`: workflow approval is missing.
- `custom_workflow_child_run_missing:<stepId>`: required child record was not supplied.
- `custom_workflow_child_run_failed:<stepId>`: a child run failed and later steps must not continue.

## Rollback

No rollback action is needed for M27 pilot views because no live child action is triggered. Disable runtime custom workflows or ignore pilot records if an operator wants to stop the workflow path.

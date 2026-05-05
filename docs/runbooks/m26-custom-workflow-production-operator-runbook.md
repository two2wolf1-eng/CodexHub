# M26 Custom Workflow Production Operator Runbook

## Purpose

Use this runbook to inspect production workflow readiness and rehearse catalog-bound workflows without enabling execution from Dashboard or CLI.

## Read-Only Checks

```bash
codexhub doctor
codexhub workflows catalog list
codexhub workflows catalog readiness local-patch-review
codexhub workflows production rehearse --template-id local-patch-review --fixture --scenario template-disabled
codexhub workflows production rehearse --template-id github-draft-pr-chain --fixture --scenario stale-template-hash
```

The same summary is visible in Dashboard `#/workflows`.

## Expected Default State

- `custom-workflow-production` is disabled by default.
- Catalog templates are discoverable and hash-addressed.
- Production dry-runs block if the template is disabled, missing, invalid, or hash-stale.
- Workflow approval is required for write/admin/remote-write templates.
- Child capability approvals remain separate and cannot be replaced by workflow approval.

## Safe Enable Checklist

- Confirm the template id and template hash shown by the catalog.
- Confirm required child integrations are enabled only where intended.
- Confirm every child dry-run, approval, and run record exists and hash-matches the workflow dry-run.
- Confirm Supervisor local-control token and trusted loopback Origin are used for POST operations.
- Confirm no raw prompt, diff, PR body, path, URL, token, cookie, session, env value, request body, or response body is stored in public output.

## Rollback

Set custom workflow production enablement back to disabled and revoke unused workflow approvals. Rehearsal and catalog views require no cleanup because they are metadata-only.

# M64 Business Quota Supervisor Control Plane Runbook

## Operator Flow

1. Inspect `/api/business-quota/readiness` before enabling any real quota-dependent dispatch.
2. Inspect `/api/business-quota/sources` and `/api/business-quota/observations` to confirm source health and redaction state.
3. Use POST dry-run shells only to create governed records; never treat request-body authority as approval.
4. If readiness is blocked, inspect the summary block reasons and create the matching HumanCheckpoint or approval request.

## Blockers

- `quota_unknown`, `quota_limited`, or `quota_exhausted`
- `source_unavailable`
- `redaction_failed`
- `quota_canary_not_passed`
- `selector_drift` or protocol/desktop drift

## Recovery

- For login or MFA, hand back to a human operator.
- For selector or redaction drift, update the manifest and rerun canary before dispatch.
- For source unavailability, prefer App Server rate limits first, then authorized Business source or pre-redacted export.

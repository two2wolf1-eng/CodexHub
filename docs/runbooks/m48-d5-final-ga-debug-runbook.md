# M48-D5 Final GA Debug Runbook

## Purpose

Use this runbook when reviewing or extending the Production GA layer after the M48-D1 to M48-D5 debug series.

## Required Checks

1. Run the no-live automation audit before and after GA operator changes.
2. Confirm GA kernel changes aggregate only existing ids, hashes, evidence refs, audit ids, counts, statuses, and summaries.
3. Confirm GA Dashboard POST helpers use exact `/api/production-ga/*` route allowlists.
4. Confirm CLI GA commands remain GET/read-only and do not read `CODEXHUB_SUPERVISOR_LOCAL_TOKEN`.
5. Confirm MCP does not expose GA mutation tools or child adapter calls.

## Stop Conditions

- GA kernel imports any child execution adapter.
- GA signoff accepts child authority, full approval artifacts, raw E2E payloads, raw docs, raw path, raw URL, raw request/response body, token, or env value.
- Dashboard persists local-control token in localStorage, sessionStorage, IndexedDB, URL, logs, evidence, or audit.
- CLI adds a generic POST helper or GA mutation command.
- No-live automation audit negative sentinels fail.

## Operator Note

GA signoff is a production readiness decision, not a child execution authority. If a child capability needs to run, use that child control plane and its own approval path first.

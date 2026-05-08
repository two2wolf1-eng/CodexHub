# M71 Admin Write Automation Runbook

## Operator Model

Business admin writes are high-risk. The only allowed live path is a fixed visible UI flow with dry-run, approval, fixed-flow runner execution, post-write verification, evidence, and audit. Generic browser/CDP automation is not an operator feature.

## Normal Flow

1. Create an admin UI dry-run through `/api/business-quota/admin-ui/dry-runs`.
2. Review the target hash, action class, risk level, and fingerprint hashes.
3. Resolve approval metadata through `/api/business-quota/admin-ui/authority-resolutions`.
4. Enable the runtime gate only for the approved maintenance window: `CODEXHUB_BUSINESS_ADMIN_UI_LIVE_WRITES_ENABLED=true`.
5. Start `/api/business-quota/admin-ui/runs` with local-control authorization.
6. The configured fixed-flow runner performs only the approved Business admin flow and returns hash-only selector/final-confirmation/post-write verification metadata.
7. Inspect `/api/business-quota/admin-ui/runs` and post-write verification output for status, boundary booleans, evidence refs, and audit ids.

## Blocks

- Missing approval artifact id leaves the run in approval-waiting.
- Missing runtime gate or missing fixed-flow runner prevents visible execution.
- Owner self-action is blocked.
- Duplicate submit is blocked.
- Selector or final confirmation fingerprint drift blocks execution.
- Credential, browser storage, raw selector/script/payload, raw DOM/AX, raw network body, request body, and response body fields are rejected.

## Recovery

If a run is blocked, do not retry by loosening the payload. Recreate the dry-run from fresh UI state, review the new fingerprint hashes, resolve a new approval if the target changed, and then rerun the fixed-flow path.

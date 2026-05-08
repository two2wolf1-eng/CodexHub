# M73 Real Client Direct Automation

## Summary

M73 adds a governed direct-client connection slice for real Chrome and Codex Desktop. CodexHub can now probe explicitly configured loopback CDP endpoints and can execute fixed Chrome CDP visible UI steps through the existing Business admin UI authority path when live writes are enabled and approval-derived authority exists.

## Scope

- Added metadata-only contracts for real client connection readiness and real client action runs.
- Added Chrome CDP connection probing and fixed click/type/submit action boundary in `playwright-observer-adapter`.
- Added Codex Desktop CDP loopback HTTP readiness probing in `electron-cdp-adapter`.
- Added Supervisor `/api/real-clients/connection-probes` and `/api/real-clients/connection-readiness`.
- Allowed Business admin UI fixed flows to use `CODEXHUB_CHROME_CDP_ENDPOINT` plus `CODEXHUB_BUSINESS_ADMIN_UI_FIXED_FLOW_JSON` when the existing live-write gate and approval path are satisfied.

## Safety

- Endpoints are read from environment only; request-body endpoints are rejected.
- Only loopback CDP endpoints are accepted.
- No token, cookie, session, MFA, password, browser storage, raw network body, raw selector, raw typed text, or raw endpoint is returned or persisted.
- Direct action execution remains under the existing dry-run, approval, authority, evidence, and audit chain.
- Codex Desktop support in this round is a metadata readiness probe only; no generic CDP command passthrough is added.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run playwright-observer-adapter:test --skip-nx-cache`
- `pnpm nx run electron-cdp-adapter:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`

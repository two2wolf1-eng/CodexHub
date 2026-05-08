# M73 Real Client Direct Automation Runbook

## Enable Chrome Connection Probe

1. Start Chrome with an explicit loopback remote debugging endpoint.
2. Set `CODEXHUB_CHROME_CDP_ENDPOINT` to the loopback endpoint.
3. Call `POST /api/real-clients/connection-probes` with local-control token and body `{ "surface": "chrome-cdp" }`.
4. Confirm the response is `ready` and contains endpoint hashes/counts only.

## Enable Codex Desktop Probe

1. Ensure Codex Desktop exposes a loopback DevTools endpoint.
2. Set `CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT` to that loopback HTTP endpoint.
3. Call `POST /api/real-clients/connection-probes` with body `{ "surface": "codex-desktop-cdp" }`.
4. Confirm target counts are returned without target titles, URLs, endpoint text, or response bodies.

## Configure Chrome Fixed UI Actions

1. Keep `CODEXHUB_BUSINESS_ADMIN_UI_LIVE_WRITES_ENABLED=false` until canaries pass.
2. Prepare `CODEXHUB_BUSINESS_ADMIN_UI_FIXED_FLOW_JSON` as an action-kind keyed object whose steps include `actionKind`, `selector`, `selectorHash`, and optional hash-bound `targetUrl` or `typedText`.
3. Create the normal Business admin UI dry-run and approval.
4. Start `/api/business-quota/admin-ui/runs` only after approval and readiness gates pass.

## Rollback

- Clear `CODEXHUB_CHROME_CDP_ENDPOINT`.
- Clear `CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT`.
- Clear `CODEXHUB_BUSINESS_ADMIN_UI_FIXED_FLOW_JSON`.
- Set `CODEXHUB_BUSINESS_ADMIN_UI_LIVE_WRITES_ENABLED=false`.

## Forbidden

- Do not put cookies, tokens, sessions, MFA codes, passwords, browser storage dumps, raw network bodies, or private keys in any fixed flow.
- Do not use non-loopback CDP endpoints.
- Do not use request body endpoint, selector, typed text, or authority material as execution authority.

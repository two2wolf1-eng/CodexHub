# M77 Codex Desktop Structure Map Runbook

## Purpose

Use this runbook to collect a governed structural map of a running Codex Desktop client through its registered loopback CDP endpoint.

## Preconditions

- `CODEXHUB_REAL_CLIENT_CALIBRATION_ENABLED=true`
- `CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT` points to a loopback HTTP endpoint.
- The surface and operation manifest are registered server-side.
- The operator has local-control access to Supervisor.

## Operation

1. Create or reuse a real-client calibration session for Codex Desktop state reads.
2. Call `POST /api/real-client-calibration/codex-desktop/structure-map-runs`.
3. Review the returned structure map:
   - probe kinds
   - panel maps
   - layout regions
   - locator candidates
   - blocked controls
   - drift signatures
4. Use blocked controls as guardrails for later automation manifests.

## Forbidden Actions

Do not use this flow to read cookies, session tokens, passwords, MFA fields, browser storage, network bodies, raw DOM, raw selectors, raw JavaScript, or raw endpoint URLs. Do not trigger logout, purchase, upgrade, add credits, save, submit, delete, account switch, Git write, or new task controls.

## Failure Handling

- `codex_desktop_cdp_endpoint_missing`: configure the loopback endpoint.
- `non_loopback_endpoint_forbidden`: replace the endpoint with loopback-only CDP.
- `codex_desktop_page_target_missing`: restart Codex Desktop with remote debugging and retry.
- `codex_desktop_structure_map_failed`: treat as drift or CDP compatibility issue and create a manifest correction proposal.

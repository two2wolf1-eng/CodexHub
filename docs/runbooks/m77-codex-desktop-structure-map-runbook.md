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
2. For short probes, call `POST /api/real-client-calibration/codex-desktop/structure-map-runs`.
3. For long exploration, call `POST /api/real-client-calibration/codex-desktop/structure-map-jobs` with the session id, then poll `GET /api/real-client-calibration/codex-desktop/structure-map-jobs/:jobId`.
4. Review the returned job metadata or structure map:
   - probe kinds
   - panel maps
   - layout regions
   - locator candidates
   - blocked controls
   - drift signatures
5. Use blocked controls as guardrails for later automation manifests.

## Background Queue

The background queue lets Supervisor own the CDP run while the operator only polls status. Job responses expose status, counts, hashes, evidence/run ids, and summaries. They do not expose raw endpoints, selectors, JavaScript, DOM, snapshots, console text, credentials, or session material.

## Forbidden Actions

Do not use this flow to read cookies, session tokens, passwords, MFA fields, browser storage, network bodies, raw DOM, raw selectors, raw JavaScript, or raw endpoint URLs. Do not trigger logout, purchase, upgrade, add credits, save, submit, delete, account switch, Git write, or new task controls.

## Failure Handling

- `codex_desktop_cdp_endpoint_missing`: configure the loopback endpoint.
- `non_loopback_endpoint_forbidden`: replace the endpoint with loopback-only CDP.
- `codex_desktop_page_target_missing`: restart Codex Desktop with remote debugging and retry.
- `codex_desktop_structure_map_failed`: treat as drift or CDP compatibility issue and create a manifest correction proposal.

# 0005 Electron/CDP Boundary

## Status

Accepted for M5.5 governed local HTTP metadata, WebSocket event observation,
and read-only UX hardening.

## Purpose

CodexHub needs an Electron/CDP observation surface for future Codex Desktop
read-only diagnostics. M5a established contracts and a fixture adapter. M5b added
a Supervisor-gated, approval-required local DevTools HTTP metadata boundary that
can read only loopback `/json/version` and `/json/list` endpoints. M5c adds a
second guarded boundary for bounded WebSocket event observation, limited to
console and network metadata.

M5c still does not connect to the Electron main inspector, inspect operating
system processes, import Electron, take screenshots, read DOM snapshots, capture
network bodies, perform UI actions, run `Runtime.evaluate`, or expose generic CDP
command passthrough.

## Provider

- Provider name: Electron/CDP controlled observer
- Adapter package: `@codexhub/electron-cdp-adapter`
- Kernel package: `@codexhub/electron-cdp-kernel`
- Provider type: builtin
- License: project license only; no Electron, CDP client, or WebSocket package is
  introduced in M5c.
- Version pinning: no new external runtime package to pin in M5c.

## Runtime Boundary

- Starts external process: no
- Reads process list: no
- Imports Electron: no
- Imports CDP client: no
- Imports `node:child_process`: no
- Uses WebSocket CDP transport: yes, only for approved bounded event observation
- Uses CDP command passthrough: no
- Uses DevTools HTTP metadata endpoints: yes, only with explicit enablement and
  approval
- Allowed HTTP method: `GET`
- Allowed paths:
  - `/json/version`
  - `/json/list`
- Requires `audit:no-live-automation` allowlist change: yes, for exactly
  `packages/electron-cdp-adapter/src/controlled-http-runner.ts` and
  `packages/electron-cdp-adapter/src/controlled-websocket-event-runner.ts`.

## M5c WebSocket Event Boundary

- Product default: disabled
- Required enablement variables:
  - `CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED=true`
  - `CODEXHUB_ELECTRON_CDP_EVENTS_ENABLED=true`
- Target selection: persisted `targetIdHash` only
- Runtime target metadata: transient only, from `/json/list`
- Runtime WebSocket URL: transient only, never stored
- Allowed commands:
  - `Log.enable`
  - `Runtime.enable`
  - `Network.enable`
- Observation window:
  - Default: 5 seconds
  - Maximum: 30 seconds
- Stored event output: counts and payload hashes only

## Enablement And Authority

- Product default: disabled
- Enablement variable: `CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED=true`
- Event enablement variable: `CODEXHUB_ELECTRON_CDP_EVENTS_ENABLED=true`
- Supervisor routes require local-control token and trusted loopback Origin for
  every mutating request.
- Dry-run records are persisted before execution.
- Controlled HTTP execution requires a persisted approved, unexpired, unused, and
  unrevoked approval artifact.
- Request-body approval artifacts and execution authority objects are untrusted.
- Runtime host and port are transient input only; they must hash-match the
  persisted dry-run endpoint summary before any HTTP request is attempted.
- Runtime target id and WebSocket endpoint are transient input only; the selected
  target must hash-match the persisted dry-run target hash before any WebSocket
  event observation is attempted.

## Allowed M5b Capabilities

- Loopback endpoint summary with hashes only
- DevTools version metadata body hash
- DevTools target-list body hash
- Target count and target summaries with target id, title, and URL hashes only
- Console and network metadata counts only
- `cdpHttpBoundaryInvoked` truth tracking
- `cdpWebSocketBoundaryInvoked` truth tracking
- Console and network event counts
- Event payload hashes
- `processBoundaryInvoked=false` and `externalProcessStarted=false`

## Forbidden By Default

- Non-loopback endpoint access
- Unapproved WebSocket CDP sessions
- Main process inspector connection
- `Runtime.evaluate`
- Generic CDP command passthrough
- Any CDP command outside the fixed event subscription allowlist
- DOM mutation
- DOM snapshot
- Screenshot capture
- Network body capture
- Click/type/UI control
- Token, cookie, session, credential, MFA, or account data extraction
- Raw host, port, target title, target URL, response body, or debugger URL
  storage
- Raw event payload, request URL, response URL, header, or body storage

## Evidence Policy

- Evidence is metadata-only.
- Raw executable paths, command lines, endpoint hosts, ports, target IDs, titles,
  URLs, console bodies, network bodies, cookies, and tokens are not stored.
- Runtime HTTP response bodies are hashed only.
- Runtime event payloads are hashed only.
- Endpoint identity, host, and port are represented as stable hashes.
- Evidence kinds:
  - `electron.process_summary`
  - `electron.debug_endpoint_summary`
  - `electron.target_summary`
  - `electron.observation_plan`
  - `electron.observation_summary`
  - `electron.run_summary`

## Store And Public Responses

Supervisor persists Electron/CDP dry-run records, approval artifacts, and run
records through `store-core` and `store-sqlite`. Public responses expose only
ids, hashes, counts, summaries, statuses, evidence refs, audit ids,
`cdpHttpBoundaryInvoked`, `processBoundaryInvoked=false`,
`cdpWebSocketBoundaryInvoked`, `externalProcessStarted=false`,
`bodyStored=false`, `rawPathStored=false`, and `noRealWrite=true`.

## M5d Read-Only UX

M5d adds human review surfaces only:

- Dashboard route: `#/electron`
- CLI commands:
  - `codexhub electron dry-runs list`
  - `codexhub electron approvals list`
  - `codexhub electron runs list`
  - `codexhub electron runs show <runId>`
  - `codexhub runs list`
  - `codexhub runs show <runId>`

These views use existing Supervisor GET endpoints only. They do not send local
control credentials, create dry-runs, create approvals, execute adapters, open
CDP connections, start WebSocket observation, or change the M5c approval model.
Rendered output remains ids, hashes, counts, summaries, statuses, evidence refs,
audit ids, and boundary booleans only.

## M5.5 Hardening

M5.5 adds no new capability. It tightens the truth model and regression coverage:

- If WebSocket event observation reads `/json/list` and then blocks before a
  WebSocket connection, `cdpHttpBoundaryInvoked=true` and
  `cdpWebSocketBoundaryInvoked=false`.
- Pre-boundary blocks keep both CDP boundary flags false and do not consume
  approval.
- Post-boundary attempts consume the persisted approval artifact, even when the
  adapter returns blocked or failed.
- `.codexhub/integrations.yaml` records the controlled WebSocket event client as
  present while keeping `electron-cdp.enabled=false` and events disabled by
  default.
- Public responses and evidence remain metadata-only.

## Rollback

Disable `CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED` and
`CODEXHUB_ELECTRON_CDP_EVENTS_ENABLED`, keep `electron-cdp.enabled=false` in
`.codexhub/integrations.yaml`, and revert the M5c WebSocket runner plus M5.5
truth-model hardening if needed. No external process or browser state is created
by M5.

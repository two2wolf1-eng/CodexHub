# 0005 Electron/CDP Boundary

## Status

Accepted for M5a foundation implementation.

## Purpose

CodexHub needs an Electron/CDP observation surface for future Codex Desktop
read-only diagnostics. M5a only defines contracts, kernel helpers, and a
fixture-only adapter. It does not connect to a real Electron application, DevTools
HTTP endpoint, WebSocket target, or operating system process list.

## Provider

- Provider name: Electron/CDP fixture adapter
- Adapter package: `@codexhub/electron-cdp-adapter`
- Kernel package: `@codexhub/electron-cdp-kernel`
- Provider type: builtin
- License: project license only for M5a; no Electron/CDP runtime dependency is
  introduced in this slice.
- Version pinning: no new external runtime package to pin in M5a.

## Process And Network Boundary

- Starts external process: no
- Reads process list: no
- Connects to CDP HTTP/WebSocket: no
- Imports Electron: no
- Imports CDP client: no
- Imports `node:child_process`: no
- Requires `audit:no-live-automation` allowlist change: no

Future real observation must be a separate M5b/M5c decision and must preserve
loopback-only endpoint rules, explicit user enablement, and process-boundary
truth fields.

## Allowed Fixture Capabilities

- Electron process summary with hashes only
- Debug endpoint summary with `loopbackOnly=true`
- Renderer target summary with title and URL hashes only
- Console summary counts only
- Network metadata summary counts only
- Narrow command allowlist decisions for:
  - `Browser.getVersion`
  - `Target.getTargets`
  - `Log.enable`

## Forbidden By Default

- Main process inspector connection
- `Runtime.evaluate`
- Generic CDP command passthrough
- DOM mutation
- DOM snapshot
- Screenshot capture
- Network body capture
- Click/type/UI control
- Token, cookie, session, credential, MFA, or account data extraction

## Evidence Policy

- Evidence is metadata-only.
- Raw executable paths, command lines, endpoint hosts, target IDs, titles, URLs,
  console bodies, network bodies, cookies, and tokens are not stored.
- Local paths and potentially identifying fields are represented as stable
  hashes.
- Evidence kinds:
  - `electron.process_summary`
  - `electron.debug_endpoint_summary`
  - `electron.target_summary`
  - `electron.observation_plan`
  - `electron.observation_summary`
  - `electron.run_summary`

## Policy And Authority

- Capability provider is not an authority provider.
- The adapter declares a `CapabilityManifest`.
- Planning is read-only and never starts a process.
- Execution requires `ExecutionAuthority.allowed=true`.
- Fixture execution emits evidence and capability audit events.
- `processBoundaryInvoked=false` and `externalProcessStarted=false` are invariant
  for M5a.

## Rollback

Remove `packages/electron-cdp-adapter`, revert the M5a Electron contract exports
and tests, remove the Electron/CDP integration stanza additions, and remove this
decision record. No external runtime state is created by M5a.

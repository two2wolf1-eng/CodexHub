# M70 Privileged Business Data Store

## Summary

M70 adds an isolated privileged Business data store for approved Business management fields. It is intentionally separate from the normal metadata projections: the store may retain cleartext Business administration fields such as member email, role, seat state, invoice summary, credit balance, pending invite state, and usage alert configuration summaries, while ordinary Supervisor responses continue to expose only ids, hashes, counts, statuses, summaries, evidence refs, and audit ids.

Credential-like material remains forbidden: cookies, sessions, tokens, MFA values, passwords, private keys, browser storage, raw network bodies, request bodies, and response bodies are rejected before persistence.

## Scope

- Added privileged Business contracts for cleartext records, access logs, and export manifests.
- Added business-quota-kernel helpers that normalize approved Business fields and reject credential-like keys or values.
- Added store-core and SQLite repositories under a separate privileged Business table family.
- Added Supervisor routes:
  - `GET /api/business-quota/privileged-business-store`
  - `POST /api/business-quota/privileged-business-records`
  - `POST /api/business-quota/privileged-business-exports`
- Added focused tests for cleartext isolation, credential rejection, access logs, export manifests, and projection redaction.

## Non-Scope

- No live admin write execution.
- No Browser/CDP click or input expansion.
- No credential collection, browser storage reads, network body reads, or token/session handling.
- No ordinary public projection returns privileged cleartext fields.

## Verification

- Focused contracts, business quota kernel, store, and Supervisor tests cover privileged store parsing, round trips, route behavior, and credential rejection.
- Closeout gates cover scaffold health, boundary audit, SQLite isolation, no-live-automation, skills audit, foundation verification, and diff whitespace checks.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for scope and acceptance, `gstack-delivery-workflow` for staged delivery, `superpowers-engineering-discipline` for small-step critical-risk execution.
- Project Skills Used and Why: `codexhub-architecture-planner` for store separation, `codexhub-contract-designer` for schemas, `codexhub-workflow-policy-reviewer` for approval/projection rules, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime are not touched in M70.

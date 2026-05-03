# 0004 Playwright Observer Adapter

## Decision

CodexHub will introduce `playwright-observer-adapter` as the M4 browser observation capability provider. M4a defined the metadata-only foundation, M4b added the approval-gated controlled local runner boundary, and M4c connects the adapter to the Supervisor governance chain. The product default remains disabled, and browser observation may only run after Supervisor local-control, persisted dry-run, persisted approval, execution authority, evidence, and audit checks all pass.

## Provider

- Project: Playwright
- Purpose: future browser read-only observation substrate
- License: Apache-2.0
- Adapter: `packages/playwright-observer-adapter`
- Current stage: M4c Supervisor-gated control plane
- Default enabled: false

## Boundary

- External process boundary: approval-gated controlled local browser runner added in M4b
- M4c does not add a new process boundary or widen no-live automation allowlists
- Supervisor execution route: `POST /api/browser/observation/runs`
- Execution input authority: persisted `dryRunId` plus persisted `approvalArtifactId`
- Request-body approval artifact or execution authority: untrusted and rejected
- Real user profile connection: disabled
- Profile probing: disabled
- Browser act operations: disabled
- Screenshot capture: approval-gated later, not implemented in M4b
- Network body storage: forbidden
- Profile path storage: hash-only

## M4b Addendum

M4b adds the first controlled browser runner behind the existing adapter boundary. The product default remains disabled. Execution requires an `ExecutionAuthority` with a persisted approval artifact id, and the runner only accepts `about:blank`, `data:text/html`, and loopback HTTP targets. It creates a non-persistent browser context and returns only title/url/accessibility hashes plus console/network counts. It does not connect to a real user profile, does not read browser storage, does not capture screenshots, and does not implement click/type/submit.

Dependency pin:

- Package: `playwright`
- Version: `1.59.1`
- License: Apache-2.0

The no-live automation audit allowlist is expanded only for `packages/playwright-observer-adapter/src/real-runner.ts`. Tests use injected loader fixtures and do not start a browser.

## M4c Addendum

M4c adds the governed browser observation control plane in Supervisor:

- `POST /api/browser/observation/dry-runs`
- `GET /api/browser/observation/dry-runs`
- `POST /api/browser/observation/approval-requests`
- `POST /api/browser/observation/manual-approvals`
- `POST /api/browser/observation/runs`
- `GET /api/browser/observation/runs`
- `GET /api/browser/observation/runs/:id`

All POST routes use the existing local-control gate and trusted loopback Origin rules. Dry-runs, approvals, and runs are persisted through store repositories. Public responses contain ids, hashes, counts, summaries, status, evidence ids, and audit ids only. Raw target URLs, raw profile paths, page bodies, network bodies, storage values, cookies, tokens, and session data are not returned.

Execution remains product-disabled unless explicitly enabled by configuration. Supervisor does not construct a real browser runner by default; tests use an injected runner to validate process-boundary truth and evidence/audit persistence without launching a browser.

## Evidence Policy

M4 evidence stores only metadata, hashes, counts, and summaries:

- profile readiness summary
- observation plan summary
- fixture observation summary
- run summary

Raw page bodies, network bodies, browser storage, profile paths, and screenshots are not persisted.

M4c additionally forbids raw target URL persistence. Target URLs are converted to stable hashes in dry-run plans and public responses.

## Risk And Authority

The adapter is a capability provider only. CodexHub governance remains the authority provider. Any future real user profile connection, screenshot capture, network body capture, or browser act capability must arrive through a separate reviewed round with explicit policy, approval, evidence, audit, and no-live automation audit updates.

## Rollback

Rollback M4c by removing the Supervisor browser observation routes, store repositories/tables, Dashboard/CLI read-only run summaries, and the M4c orchestration/config stanzas. The M4b adapter boundary remains independently removable by deleting `packages/playwright-observer-adapter`, removing tsconfig/scaffold entries, and removing the disabled `playwright-observer` integration stanza.

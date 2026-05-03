# 0004 Playwright Observer Adapter

## Decision

CodexHub will introduce `playwright-observer-adapter` as the M4 browser observation capability provider, but M4a keeps it fixture-only and disabled by product default. It defines the contract, manifest, dry-run plan, evidence, audit, and read-only UI/CLI summaries without opening a browser or connecting to a profile.

## Provider

- Project: Playwright
- Purpose: future browser read-only observation substrate
- License: Apache-2.0
- Adapter: `packages/playwright-observer-adapter`
- Current stage: M4b controlled local runner
- Default enabled: false

## Boundary

- External process boundary: approval-gated controlled local browser runner in M4b
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

## Evidence Policy

M4 evidence stores only metadata, hashes, counts, and summaries:

- profile readiness summary
- observation plan summary
- fixture observation summary
- run summary

Raw page bodies, network bodies, browser storage, profile paths, and screenshots are not persisted.

## Risk And Authority

The adapter is a capability provider only. CodexHub governance remains the authority provider. Any future real user profile connection, screenshot capture, network body capture, or browser act capability must arrive through a separate reviewed round with explicit policy, approval, evidence, audit, and no-live automation audit updates.

## Rollback

Remove `packages/playwright-observer-adapter`, remove the tsconfig/scaffold entries, and remove the disabled `playwright-observer` integration stanza. Since M4a does not add persistence or live process boundaries, rollback is limited to code/config removal.

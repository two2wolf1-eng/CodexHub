# 0004 Playwright Observer Adapter

## Decision

CodexHub will introduce `playwright-observer-adapter` as the M4 browser observation capability provider, but M4a keeps it fixture-only and disabled by product default. It defines the contract, manifest, dry-run plan, evidence, audit, and read-only UI/CLI summaries without opening a browser or connecting to a profile.

## Provider

- Project: Playwright
- Purpose: future browser read-only observation substrate
- License: Apache-2.0
- Adapter: `packages/playwright-observer-adapter`
- Current stage: M4a foundation
- Default enabled: false

## Boundary

- External process boundary: none in M4a
- Real browser connection: disabled
- Profile probing: disabled
- Browser act operations: disabled
- Screenshot capture: approval-gated later, not implemented in M4a
- Network body storage: forbidden
- Profile path storage: hash-only

## Evidence Policy

M4a evidence stores only metadata, hashes, counts, and summaries:

- profile readiness summary
- observation plan summary
- fixture observation summary
- run summary

Raw page bodies, network bodies, browser storage, profile paths, and screenshots are not persisted.

## Risk And Authority

The adapter is a capability provider only. CodexHub governance remains the authority provider. Any future real browser connection must arrive through a separate reviewed round with explicit policy, approval, evidence, audit, and no-live automation audit updates.

## Rollback

Remove `packages/playwright-observer-adapter`, remove the tsconfig/scaffold entries, and remove the disabled `playwright-observer` integration stanza. Since M4a does not add persistence or live process boundaries, rollback is limited to code/config removal.

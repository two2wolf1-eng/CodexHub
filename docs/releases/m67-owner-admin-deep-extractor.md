# M67 Owner Admin Deep Extractor

## Summary

M67 adds a metadata-only owner admin extraction surface for Business management pages. It records hashed summaries for members, billing, pending invites, seat allocation, add-credits readiness, and usage alerts.

This round does not connect to Chrome/CDP and does not read browser storage, credentials, cookies, sessions, tokens, network bodies, or raw page content.

## GSD Spec

- Goal: make owner admin Business management fields projectable as governed metadata.
- Scope: contracts, business-quota-kernel, store repositories, Supervisor projections, scaffold registration, docs.
- Non-scope: real owner admin browsing, real CDP/DOM extraction, privileged cleartext store, workspace switching, and admin writes.
- Risk: high.
- Acceptance: focused tests, scaffold health, audits, and foundation verification pass.

## Changes

- Added owner admin read surface, member roster, billing summary, and extraction report contracts.
- Added `createOwnerAdminExtractionBundle` to produce fixture/injected metadata projections.
- Added SQLite repositories for owner admin surfaces, roster snapshots, billing summaries, and extraction reports.
- Added Supervisor projections under `/api/business-quota/*` for owner admin reports, member roster, pending invites, seat allocation, and extraction rehearsal.

## Verification

Run before closeout:

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run business-quota-kernel:test --skip-nx-cache`
- `pnpm nx run store-sqlite:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`

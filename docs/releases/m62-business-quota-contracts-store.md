# M62 Business Quota Contracts And Store

## Goal

Add metadata-only Business/Codex quota language and automation authority records so later
read-only and UI/CDP automation can be governed by shared contracts.

## Scope

- `packages/contracts`
- `packages/store-core`
- `packages/store-sqlite`
- `packages/business-quota-kernel`

## Non-Scope

- No live ChatGPT Business admin operation.
- No cookie, token, session, storage, MFA, password, or credential collection.
- No direct Supervisor-to-adapter execution.

## Verification

- `pnpm nx test contracts`
- `pnpm nx build contracts`
- `pnpm nx build store-core`
- `pnpm nx test store-sqlite`
- `pnpm nx build store-sqlite`

## Result

M62 adds quota source health, quota attribution, UI observation, UI automation authority,
and sensitive redaction models with SQLite metadata repositories and focused tests.

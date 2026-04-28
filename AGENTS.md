# CodexHub Agent Rules

## Build Order

Work from shared language outward:

1. `packages/contracts`
2. Kernel packages
3. Apps

Contracts are the only shared DTO/schema/type language. When shared contracts change, update tests in every dependent package touched by the change.

## Safety Rules

- All dangerous actions must be dry-run first.
- Do not bypass login, MFA, account limits, quotas, permissions, or workspace governance.
- Browser and Electron automation are read-only by default.
- Browser click/input automation is not allowed in the foundation scaffold.
- Electron main inspector connections are not allowed in the foundation scaffold.
- All write operations must pass policy, approval, evidence, and audit gates.
- No token, cookie, session, MFA, account, or credential collection is allowed.
- New features must include focused tests.

## Package Boundaries

- Apps and packages must import from public package entrypoints only.
- Do not import from another package's internal `src` path.
- `node:sqlite` is isolated to `packages/store-sqlite`.
- `store-core` exposes async repository interfaces only.


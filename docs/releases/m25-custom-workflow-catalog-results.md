# M25 Custom Workflow Catalog Results

## Scope

M25 introduced a production workflow catalog without enabling production execution. The catalog is metadata-only and covers four disabled built-in templates:

- `local-patch-review`
- `local-rc-bundle`
- `github-draft-pr-chain`
- `rework-cleanup`

## Results

- Added catalog contracts for entries, readiness, family summaries, and production validation summaries.
- Added disabled JSON templates under `.codexhub/workflows`.
- Added workflow-kernel catalog loading and readiness helpers.
- Added read-only Dashboard and CLI catalog views.
- Added audit coverage for forbidden raw fields and policy-weakening fields in production workflow templates.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run workflow-kernel:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- Focused lint/build for changed projects.

## Safety

Production execution remains disabled by default. UI and CLI catalog views do not send POST requests, read local-control tokens, or call adapter execute helpers.

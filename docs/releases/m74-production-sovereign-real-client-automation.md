# M74 Production Sovereign Real Client Automation

## Summary

M74 introduces the production real-client governance layer for Chrome-hosted ChatGPT, Codex Web/Cloud, Codex Desktop, Codex CLI, and local repo workflows. The implementation adds shared contracts, a kernel package, SQLite repositories, and guarded Supervisor routes for registered surfaces, operation manifests, dry-runs, store-resolved authority, execution records, evidence, audit, production jobs, canary drift, and break-glass sessions.

This round intentionally does not add a generic CDP, selector, JavaScript, shell, or operate-any-page endpoint. Production writes remain disabled by default and require registered surfaces, reviewed operation manifests, local-control route gates, dry-run, approval/authority where required, evidence, and audit.

## Delivered

- Added production capability classes, evidence levels, forbidden capabilities, real-client surface registrations, operation manifests, authority refs, approval bindings, run records, evidence vault records, audit ledger entries, jobs, canary drift reports, and break-glass sessions.
- Added `production-real-client-kernel` for classification, manifest validation, dry-run generation, authority resolution, evidence policy, audit ledger entries, and job metadata.
- Added SQLite repositories and tables for M74 real-client production records.
- Added guarded `/api/real-clients/*` routes for clients, surfaces, capabilities, dry-run, execute, break-glass, evidence, audit, and jobs.
- Changed real-client connection probes so unknown surfaces are rejected instead of silently falling back to Chrome.
- Updated project skills to allow explicitly approved production real automation only through the new governance skill and registered manifests.

## Safety

Forbidden capabilities remain impossible from production routes: cookie/session/token reads, password/MFA reads, login/MFA/permission bypass, user impersonation, browser credential extraction, session replay, and unowned-session operation.

Production route request bodies reject caller-supplied raw CDP endpoints, selectors, JavaScript, DOM/body payloads, storage material, credentials, approval artifacts, execution authority, and authority refs. Public output is hashes, ids, statuses, counts, summaries, evidence ids, audit ids, and boundary booleans.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run production-real-client-kernel:test --skip-nx-cache`
- `pnpm nx run store-sqlite:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risks

- Real adapter execution for ChatGPT/Codex Web/Desktop/CLI remains governed by the new route and manifest layer but must be wired in later subrounds with fixed adapter runners.
- `CODEXHUB_PRODUCTION_REAL_CLIENTS_ENABLED` remains off by default.
- Break-glass E4 raw artifacts require encrypted short-TTL handling and still cannot contain E5 secret material.

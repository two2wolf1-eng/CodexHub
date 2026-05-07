# M48-D3 GA Store Signoff Debug

## Summary

M48-D3 reviewed Production GA persistence and signoff semantics after the public projection fuzz round. The round focused on save/list/get metadata-only behavior and on the critical GA requirement that release signoff needs two distinct store-resolved approver hashes.

## GSD Spec

- Goal: prove GA store round-trips and signoff state transitions remain metadata-only and approval-strict.
- Scope: production-ga-kernel signoff tests, production GA SQLite store tests, D3 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new route, provider, store repository, live boundary, child execution, or GA capability behavior.
- Acceptance: focused kernel/store/Supervisor tests pass and full foundation gates pass.
- Risk: critical, because GA signoff is the final production release readiness gate.

## Debug Finding

D3 found a narrow schema/semantics mismatch: the GA signoff schema rejected duplicate-approver blocked records before the kernel could return a metadata-only blocked signoff. The schema now requires two distinct approvals only for `ready` and `conditionally_ready` signoffs, while blocked duplicate-approver records can be represented safely with zero approval consumption.

The round also expanded GA SQLite round-trip checks so every GA repository is verified through both get and list paths where applicable.

## Verification

- `pnpm nx run-many --target=test "--projects=production-ga-kernel,store-core,store-sqlite,supervisor" --skip-nx-cache`
- Focused lint/build for touched projects.
- Full closeout gates before commit.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for scope/risk/acceptance, `gstack-delivery-workflow` for staged D3 delivery, `superpowers-engineering-discipline` for test-first hardening without new capability.
- Project Skills Used and Why: `codexhub-contract-designer` for GA schema posture review, `codexhub-workflow-policy-reviewer` for approval semantics, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Browser/Electron/MCP/policy/telemetry/runtime execution skills were not used because D3 changes no execution surface.

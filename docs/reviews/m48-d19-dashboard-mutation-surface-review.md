# M48-D19 Dashboard Mutation Surface Review

## Review Scope

- `apps/dashboard/src/read-only-ux.test.ts`
- D19 scaffold and orchestration registration

## Findings

D19 did not find a product implementation bug. It did find a useful test precision issue while adding the regression: `pageMemoryKey` must be allowed in the local-control header but must not be placed into JSON request bodies. The final regression now checks the exact helper function windows instead of broad file slices and keeps the risk focused on unsupported helpers, token persistence, inline body construction, and raw authority/body fields.

No new provider, route, store repository, live boundary, Dashboard write panel, Browser automation, remote write, push, or PR was added.

## Controls Confirmed

- Dashboard POST route sets remain exact.
- Guided mutation helpers keep the local-control token in the configured header.
- Helper bodies remain `JSON.stringify(body)` rather than inline construction containing token, authority, raw body, child artifacts, or raw path metadata.
- New unreviewed write helpers for Browser, Electron, MCP, runtime, external agents, platform, secrets, GitHub Actions, and releases are statically blocked.
- Existing token persistence sentinels still reject localStorage, sessionStorage, indexedDB, cookies, URL mutation, and history persistence.

## Residual Risk

D19 does not inspect CLI mutation commands. D20 should verify exact CLI mutation allowlists, no `--token`, no generic POST helper, and no local-control token reads from read-only command groups.

## Verification Evidence

- `pnpm nx run dashboard:test --skip-nx-cache` failed before test refinement.
- `pnpm nx run dashboard:test --skip-nx-cache` passed after the helper-window assertion was corrected.

## Workflow Skills Used And Why

- `gsd-spec-driver`: bounded D19 as Dashboard mutation-surface debug only.
- `gstack-delivery-workflow`: guided staged inspection, test hardening, review, and QA.
- `superpowers-engineering-discipline`: kept the round small, reversible, and free of product behavior changes.

## Project Skills Used And Why

- `codexhub-architecture-planner`: checked no app-to-adapter path was introduced.
- `codexhub-workflow-policy-reviewer`: checked local-control, authority, approval, and raw metadata boundaries.
- `codexhub-playwright-qa`: shaped Dashboard QA scope and degraded/mutation-surface expectations.
- `codexhub-release-auditor`: shaped verification evidence and next-round notes.

## Skills Not Used And Why

- `codexhub-contract-designer`: no schema changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D19 did not modify those execution surfaces.

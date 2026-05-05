# M0-M24 Projection Round-Trip Hardening Review

## Scope

M24.11 reviewed the M0-M24 governance baseline for public projection round-trip safety, late-stage approval state semantics, audit drift, and UI/CLI/MCP read-only drift. This was a hardening-only round.

## Findings And Fixes

- Added a shared adversarial public-output round-trip helper so projection tests serialize, parse, and re-serialize representative public records before checking for raw prompt, stdout, stderr, diff, path, URL, file content, PR markdown, reason, token, cookie, session, env, request body, and response body leakage.
- Extended representative projection tests across governance projection, operator readiness, approval history, GitHub provider summaries, review packages, release candidates, custom workflows, and SQLite persisted records.
- Added a custom workflow Supervisor approval-state regression: a pre-boundary hash mismatch remains blocked without consuming the approved artifact, while the later valid metadata-only run can consume it.
- Hardened the no-live audit negative fixtures for dynamic adapter execute lookup, bracket fetch access, and indirect process env access in MCP-like source.
- Deepened CLI and MCP source-level checks for read-only surfaces so they continue to reject local-control env reads, POST construction, process/network shortcuts, and adapter execute helpers.

## Residual Risk

- This round did not add new capability coverage for Browser, Electron/CDP, MCP write tools, policy runtime, telemetry exporter, or GitHub remote writes.
- Store repositories persist already-sanitized records; sanitization remains the responsibility of upstream serializers and kernels before persistence.
- Existing governed approval decision mutation remains the only UI/CLI local-control exception.

## Verification Plan

- Focused tests for Supervisor, CLI, Dashboard, MCP, projection kernels, store packages, and GitHub/review/RC/workflow packages.
- Governance audits: scaffold health, boundaries, SQLite isolation, no-live automation, skills, and foundation verification.
- Diff hygiene: `git diff --check` and clean git status before commit.

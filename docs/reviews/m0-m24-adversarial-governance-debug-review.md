# M0-M24 Adversarial Governance Debug Review

## Scope

M24.9 reviewed the M0-M24 governance baseline without adding product capability. The review focused on route coverage drift, UI/CLI/MCP read-only boundaries, no-live audit negative fixtures, metadata-only public serialization, and late-stage approval authority semantics.

## GSD Spec

- Goal: make the existing M0-M24 baseline harder to regress before M25 feature work.
- Scope: governance audits, Supervisor tests, Dashboard/CLI/MCP tests, projection/readiness/provider/review package helpers, docs, and scaffold health.
- Non-scope: no new route, provider, store repository, live boundary, remote write path, Browser act, Electron main inspector, MCP write tool, policy runtime, or telemetry exporter.
- Acceptance: focused tests, governance audits, foundation verification, diff check, and clean git status.
- Risk: high, because this touches governance guardrails across late-stage control planes.

## Findings And Fixes

- Added adversarial sentinels to the no-live automation audit so synthetic direct adapter execution, token env usage, process/network boundary access, and forbidden GitHub operations must be detected by the audit helper.
- Added Supervisor route drift coverage so late-stage POST route families must remain synchronized with the table-driven local-control and Origin gate tests.
- Added Dashboard, CLI, and MCP source-level guards for read-only surfaces: no unexpected POST, no local-control token persistence/read, no process/network boundary imports, and no direct adapter execute usage.
- Expanded metadata-only regression checks across governance projection, operator readiness, approval history, GitHub provider summaries, and review package projection.
- Fixed review package projection to normalize caller-supplied `diffHash` and `changedFilePathHashes` into hash-only values before public output.

## Residual Risk

- M24.9 remains a hardening round. It does not exercise real remote writes, Browser act, Electron main inspector, MCP write tools, policy runtimes, or telemetry exporters.
- Existing governed approval decision mutation remains the only UI/CLI local-control exception.
- Some public fields intentionally expose ids; upstream callers must continue to treat ids as non-secret identifiers.

## Skills Used

- Workflow Skills Used and Why: `gsd-spec-driver` for scope/risk/acceptance, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, and `superpowers-engineering-discipline` for no scope creep and evidence-first hardening.
- Project Skills Used and Why: `codexhub-workflow-policy-reviewer` for approval/evidence/audit invariants, `codexhub-architecture-planner` for UI/CLI/MCP/Supervisor boundary review, and `codexhub-release-auditor` for verification and closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP, Playwright runtime QA, policy backend runtime, and telemetry exporter runtime were not used because M24.9 reviews boundaries without extending those capability surfaces.

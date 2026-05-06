# M0-M45 Public Projection Fuzz Review

Review round: M45.2

## Objective

Make public projection serialization harder to regress by ensuring late-stage M44/M45 public objects are checked against the same adversarial forbidden-output fixture used by CLI and Dashboard tests.

## GSD Spec

- Goal: prevent raw public-output leaks across contracts, CLI, Dashboard, and Supervisor-style summaries.
- Scope: test fixtures, contracts tests, docs, orchestration, and scaffold health.
- Non-scope: no schema expansion, route change, provider change, live boundary, external execution, or remote write.
- Acceptance: focused contracts/CLI/Dashboard tests and full foundation gates pass.
- Risk: critical because M44/M45 introduced sensitive runtime directions even though outputs remain metadata-only.

## Findings

- Existing schemas already reject raw metadata via contract refinements.
- The shared fixture now covers policy source/input/output, telemetry span/log payloads, Browser selectors/text, Electron JavaScript, and MCP patch content.
- Contracts now round-trip representative M44/M45 public objects through JSON serialization and assert no shared adversarial terms survive.

## Residual Risk

- This round checks representative public objects. Later store and Supervisor rounds must ensure persisted list/get paths and route responses preserve the same metadata-only invariant.

## Skills Used

- gsd-spec-driver: kept the round scoped to public projection fuzzing.
- gstack-delivery-workflow: delivered a focused Build/Review/QA/Ship increment.
- superpowers-engineering-discipline: preferred test hardening over capability changes.
- codexhub-contract-designer: reviewed schema-facing public object checks.
- codexhub-workflow-policy-reviewer: reviewed metadata-only and no raw authority leakage.
- codexhub-playwright-qa: covered Dashboard public summary expectations through existing tests.
- codexhub-release-auditor: recorded verification and rollback expectations.

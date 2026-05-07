# M48-D12 Approval Consumption Semantics Review

## Review Scope

- `apps/supervisor/src/server.test.ts`
- `apps/supervisor/src/server.ts`
- D12 scaffold and orchestration registration

## Findings

M48-D12 found one implementation gap: completed M44/M45 real policy, telemetry, Browser, Electron, and MCP write runs emitted audit ids but no evidence refs. The fix adds one metadata-only evidence ref per completed run, keyed to existing kind-specific summary evidence and hashed metadata only.

No route, provider, store repository, live boundary, or product execution behavior was added.

## Controls Confirmed

- PR management pre-boundary blocks leave approvals unused and do not invoke the GitHub network boundary.
- PR management boundary-reached failure preserves `networkBoundaryInvoked: true` and consumes the approval exactly once.
- Deployment operation pre-boundary blocks leave approvals unused and do not start the process boundary.
- Deployment boundary-reached failure preserves process boundary truth and consumes the matching approval exactly once.
- M44/M45 completed runs now include both evidence and audit metadata, while reused approvals remain blocked without re-triggering the completed boundary.
- Caller-supplied authority remains outside the D12 implementation path.

## Residual Risk

D12 focuses on approval/evidence/audit semantics for representative late-stage surfaces. D13 should deepen GitHub fixed-boundary coverage across PR management, merge, Actions, release tags/drafts, and cleanup.

## Verification Evidence

- `pnpm nx run supervisor:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: bounded D12 as approval consumption debug only.
- `gstack-delivery-workflow`: guided the staged test, fix, verify, and document flow.
- `superpowers-engineering-discipline`: prevented broad behavior changes and kept the fix metadata-only.

## Project Skills Used And Why

- `codexhub-architecture-planner`: checked that the evidence fix did not add a new boundary or repository.
- `codexhub-workflow-policy-reviewer`: reviewed approval consumption and evidence/audit invariants.
- `codexhub-release-auditor`: shaped closeout evidence and next-risk notes.

## Skills Not Used And Why

- `codexhub-contract-designer`: schemas already allow evidence refs and did not need modification.
- `codexhub-playwright-qa`: no Dashboard route or browser smoke behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because no runtime expansion occurred.

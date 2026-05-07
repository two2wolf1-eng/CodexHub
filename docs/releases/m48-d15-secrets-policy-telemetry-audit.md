# M48-D15 Secrets Policy Telemetry Audit

## GSD Spec

- Goal: deepen secrets hash-only, policy advisory-only, and telemetry non-authoritative regression coverage.
- Scope: `packages/secret-governance-kernel`, `packages/policy-backend-adapter`, D15 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no provider, route, store repository, live boundary, secret read, policy authority transfer, telemetry-as-audit replacement, or network exporter enablement.
- Acceptance criteria: focused secrets, policy, and telemetry tests pass; closeout gates pass before commit.
- Hard boundaries: secret values are never read or returned, OPA/Cedar remain advisory-only, raw policy/input/output is never public, and telemetry remains non-authoritative metadata.
- Affected apps/packages: `packages/secret-governance-kernel`, `packages/policy-backend-adapter`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because these surfaces sit near credentials, policy decisions, and observability records.

## GStack Plan

- Plan: add adversarial tests around existing helpers before changing implementation.
- Build: test all secret providers and hostile policy runner summaries; fix only the narrow leak found.
- Review: confirm policy backends still cannot grant CodexHub authority and telemetry does not replace Evidence/Audit.
- QA: run focused tests first, then full foundation gates.
- Ship: register D15 docs and commit after clean verification.
- Retro: D16 should continue into Browser, Electron, and MCP controlled write boundaries.

## Superpowers Checklist

- Small scoped tests and narrow serializer fix.
- No unrelated refactor.
- No secret/provider runtime call.
- No policy authority transfer.
- Evidence over claims: completion requires recorded command results.

## Changes

- Added all-provider secrets readiness coverage for Vault, SOPS, 1Password, and Doppler with adversarial env/private-key/config inputs.
- Added a real policy backend regression proving injected CLI runner summaries are untrusted public output.
- Fixed the policy CLI boundary to return fixed advisory metadata summaries instead of runner-provided summary text.
- Rechecked telemetry adapter tests to confirm non-authoritative local/network export behavior remains green.

## Verification

- `pnpm nx run policy-backend-adapter:test --skip-nx-cache` passed.
- `pnpm nx run secret-governance-kernel:test --skip-nx-cache` passed.
- `pnpm nx run otel-adapter:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D15 goal, scope, non-scope, acceptance, and critical boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the work scoped and evidence-first.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no new route, provider, store, or boundary was needed.
- `codexhub-workflow-policy-reviewer`: guided secret hash-only, policy advisory-only, and telemetry non-authoritative invariants.
- `codexhub-release-auditor`: used for closeout verification and next-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: contracts were not changed.
- `codexhub-playwright-qa`: Dashboard UI was not changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because this round stayed in local tests and a metadata-only summary fix.

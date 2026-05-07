# M48-D24 Adversarial Static Audit Expansion

## GSD Spec

- Goal: deepen `audit:no-live-automation` negative fixtures so future static drift is caught before it reaches product source.
- Scope: `tools/audit-no-live-automation.ts`, D24 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new product capability, provider, route, store repository, live boundary, runtime behavior, real live smoke, remote write, push, or PR.
- Acceptance criteria: `audit:no-live-automation` passes with the expanded adversarial sentinels; closeout gates pass before commit.
- Hard boundaries: this round may only add audit sentinels and docs/config registration. It must not add allowlist entries or broaden live automation permissions.
- Affected apps/packages: `tools/audit-no-live-automation.ts`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because static audit false negatives can allow future bypasses of live-boundary governance.

## GStack Plan

- Plan: read D23 residual risk and inspect existing no-live adversarial sentinels.
- Build: add negative fixtures for generic URL+POST, split storage wrappers, global process env access, and segmented shell/apply command builders.
- Review: confirm no allowlist or live-boundary expansion was added.
- QA: run `audit:no-live-automation`, then full closeout gates.
- Ship: register D24 docs and commit after clean verification.
- Retro: D25 should summarize the whole D6-D24 sequence into a final baseline.

## Superpowers Checklist

- Add tests before any implementation permission change.
- Do not broaden allowlists.
- Avoid unrelated audit refactors.
- Verify the audit catches the new sentinels.

## Changes

- Added segmented deployment command sentinels for `kubectl apply` and `terraform apply` builders.
- Added MCP sentinels for `globalThis["process"]` and `globalThis['process']` env access.
- Added Dashboard sentinels for generic URL+POST helpers and split `indexedDB` storage wrappers.
- Kept live-boundary and allowlist definitions unchanged.

## Verification

- `pnpm audit:no-live-automation` passed with the expanded negative fixture set.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D24 goal, scope, non-scope, and audit-only acceptance.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the round to minimal sentinel hardening without capability changes.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no package/control-plane boundary changed.
- `codexhub-workflow-policy-reviewer`: reviewed the sentinels against no-live, no-bypass, and metadata-only governance.
- `codexhub-release-auditor`: used for closeout evidence and residual-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contracts or schemas changed.
- `codexhub-playwright-qa`: no Dashboard behavior changed; only static audit sentinels were updated.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D24 did not execute or expand those surfaces.

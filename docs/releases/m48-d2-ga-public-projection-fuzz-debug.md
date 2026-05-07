# M48-D2 GA Public Projection Fuzz Debug

## Summary

M48-D2 deepens the GA metadata-only regression net. The round reviewed GA contracts, kernel summaries, Supervisor responses, CLI formatting, and Dashboard summaries for adversarial raw-output leakage.

## GSD Spec

- Goal: prevent raw GA source material from reaching public projections.
- Scope: Production GA contracts, production-ga-kernel summaries, Dashboard GA read-only summaries, CLI/Supervisor projection tests, and D2 docs.
- Non-scope: no new route, provider, store repository, live boundary, child execution, or workflow behavior.
- Acceptance: focused contracts/kernel/Supervisor/CLI/Dashboard tests pass and full foundation gates pass.
- Risk: critical, because GA aggregates every high-risk control plane.

## Debug Finding

Dashboard GA status fields accepted arbitrary upstream strings. Although normal Supervisor data is already constrained, this was a weak public projection edge for degraded or mocked data. D2 now normalizes GA public status strings to a fixed status vocabulary before rendering summary output.

## Verification

- `pnpm nx run-many --target=test "--projects=contracts,production-ga-kernel,supervisor,cli,dashboard" --skip-nx-cache`
- Focused lint/build for touched projects.
- Full closeout gates before commit.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for scope/risk/acceptance, `gstack-delivery-workflow` for small-step delivery, `superpowers-engineering-discipline` for minimal serializer hardening.
- Project Skills Used and Why: `codexhub-contract-designer` for contract fixture review, `codexhub-workflow-policy-reviewer` for metadata-only output invariants, `codexhub-playwright-qa` for Dashboard degraded-state projection, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Browser/Electron/MCP/policy/telemetry/runtime execution skills were not used because D2 changes no execution surface.

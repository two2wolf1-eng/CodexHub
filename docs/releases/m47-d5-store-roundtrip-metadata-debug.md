# M47-D5 Store Round-Trip Metadata Debug

## Summary

M47-D5 deepened the store round-trip regression net for M0-M47 metadata-only records.
The round did not add product capability, routes, providers, store repositories, live
boundaries, or remote writes.

## Scope

- `packages/store-sqlite`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D5 release/review documentation

## Findings

- No implementation leak was found in the SQLite repository layer.
- Existing runtime, external-agent, and platform-operation records already reduced
  sensitive input fields to hashes before persistence.
- The prior tests used mild fixture values, so this round upgraded them to use the
  shared adversarial public-output fixture as real store input.

## Fixes And Hardening

- Runtime scheduler store round trips now cover adversarial target records, source
  records, lock keys, concurrency seeds, worker ids, lease secrets, and checkpoint
  step ids.
- External agent store round trips now cover adversarial worktree ids, worktree
  paths, prompts, instructions, CLI executable metadata, approvals, runs, and patch
  summaries.
- Platform operations store round trips now cover adversarial backup roots, store
  snapshots, restore manifests, schema seeds, retention policy seeds, audit export
  destinations, operator identities, scopes, approval approvers, and approval
  reasons.
- The round is registered in orchestration and scaffold health.

## Verification

- `pnpm nx run store-sqlite:test --skip-nx-cache`

## Residual Risk

- D5 is a store metadata regression round only. Approval consumption, route gate,
  adapter fixed-boundary, and UI/CLI/MCP surface checks remain assigned to later
  M47-D rounds.

# M18 Remote Publish Draft PR Results

Status: implementation and hardening evidence for the governed remote branch publish to draft PR chain.

## Capability

- Added metadata-only publish-to-draft-PR chain contracts and adapter helpers.
- Added Supervisor `/api/github/publish-draft-pr-chains/*` dry-run and run projection routes.
- Added PR lifecycle summary projection from existing governed child run metadata.
- Added Dashboard and CLI read-only chain views plus fixture-only acceptance rehearsal.

## Safety Baseline

- Product default remains disabled.
- M18 does not add a new GitHub HTTP boundary file.
- Branch publish and draft PR creation still require separate persisted approvals through their existing control planes.
- The chain projection does not directly call GitHub, does not push, does not update refs, does not merge, and does not delete remote branches.
- If branch publish fails, draft PR creation is skipped. If draft PR creation fails after branch creation, M18 records recovery metadata only.

## Evidence Model

Public records expose only ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans. Raw token values, owner/repo/ref strings, file content, request bodies, response bodies, URLs, check logs, comments, review bodies, and PR markdown are not persisted or returned.

## Verification Targets

- `pnpm nx run github-provider-adapter:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm audit:no-live-automation`
- `pnpm verify:foundation`

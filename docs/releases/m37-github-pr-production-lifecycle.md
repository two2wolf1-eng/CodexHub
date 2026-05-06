# M37 GitHub PR Production Lifecycle

## Summary

M37 adds governed GitHub PR management control planes for labels, assignees, reviewers, milestones, and comments. Each action family has its own dry-run, approval, manual approval, run, evidence, and audit records.

No merge, push, update-ref, force, branch deletion, arbitrary GitHub passthrough, release, deployment, label removal, assignee removal, reviewer dismissal, milestone clearing, or comment edit/delete was added.

## Delivered

- Added metadata-only PR management contracts and evidence kinds.
- Extended the existing single audited GitHub HTTP boundary with fixed PR management endpoint sequences.
- Added five independent Supervisor route families:
  - `/api/github/pr-labels/*`
  - `/api/github/pr-assignees/*`
  - `/api/github/pr-reviewers/*`
  - `/api/github/pr-milestones/*`
  - `/api/github/pr-comments/*`
- Added store repositories for each family dry-run, approval, and run records.
- Added Dashboard `#/github` and CLI read-only views for PR management summaries and fixture rehearsals.

## Safety

- Product defaults remain disabled.
- Live runs require `CODEXHUB_GITHUB_PROVIDER_ENABLED=true`, the family-specific enablement flag, `CODEXHUB_GITHUB_TOKEN`, trusted loopback origin, local-control token, persisted approval, execution authority, and hash-bound runtime input.
- Request-body approval artifacts, execution authority, raw bodies, raw URLs, token values, and raw response bodies are rejected or excluded.
- Comments use fixed generated templates from approved metadata summaries; raw arbitrary comment bodies are not persisted or returned.
- Public output remains ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and network boundary booleans only.

## Verification

Target gates:

- `pnpm nx run-many --target=test "--projects=contracts,github-provider-adapter,store-core,store-sqlite,supervisor,cli,dashboard" --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

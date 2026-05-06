# M47-D2 Scaffold Registration Debug

Status: completed

## GSD Spec

- Goal: make the M0-M47 debug baseline visible to scaffold health, orchestration, integrations, and the capability matrix.
- Scope: `tools/scaffold-health.ts`, `.codexhub/orchestration.yaml`, `.codexhub/integrations.yaml`, and M0-M47 review docs.
- Non-scope: no provider, route, store repository, live boundary, remote write, push, or pull request behavior.
- Risk: critical, because this protects future debug rounds from silently drifting out of governance registration.
- Acceptance: scaffold health and full foundation gates pass after registration.

## Result

- Added D1 and D2 release/review artifacts to scaffold health.
- Registered M47-D1 and M47-D2 as review-only orchestration rounds.
- Added a disabled review-only M0-M47 deep debug baseline integration entry.
- Updated the M0-M47 capability matrix with the M47-D debug registration rule.

## Verification

- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

# M32 Production Recovery Operator Acceptance

## Acceptance Checklist

- Dashboard `#/workflows` loads without requiring a stored key.
- The recovery panel supports `local-patch-review`, `github-draft-pr-chain`, and `rework-cleanup`.
- The local-control key is entered per page session and is not persisted.
- Dry-run, approval request, manual workflow approval, run, and resume use only `/api/workflows/production/recoveries/*`.
- Child approval waits are visible and do not trigger automatic child approval.
- CLI recovery commands remain read-only.
- No new provider, route, store repository, or live boundary is introduced.

## Evidence To Capture

- Focused Dashboard test output.
- Focused Supervisor test output.
- `pnpm audit:no-live-automation`.
- Foundation governance gates.


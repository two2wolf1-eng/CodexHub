# M40 Release Lifecycle Operator Runbook

## Preconditions

- GitHub provider runtime enablement is explicit.
- `CODEXHUB_GITHUB_TOKEN` is configured in the local environment when live GitHub operations are intended.
- Tag and release draft runtime flags remain disabled unless intentionally enabled.
- Local-control token is supplied only to the Supervisor control plane.

## Operator Flow

1. Review version plan and changelog metadata.
2. Create or inspect release tag dry-run metadata.
3. Request and approve tag creation only when the target hashes and blockers are acceptable.
4. Run tag creation through the Supervisor control plane.
5. Create or inspect release draft dry-run metadata.
6. Request and approve draft release creation only after tag metadata is ready.
7. Review evidence and audit ids.

## Stop Conditions

- Token missing or provider disabled.
- Existing tag or release draft detected.
- Hash mismatch.
- Raw body/path/token output appears.
- Any route attempts release publish, push, force, merge, deployment, or arbitrary GitHub passthrough.

## Rollback Notes

M40 does not implement release publish or deletion. Any remote cleanup must be handled by a later governed milestone.

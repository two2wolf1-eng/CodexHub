# M31 Production Recovery Dashboard Runbook

## Before Starting

- Confirm production workflow recovery is explicitly enabled in runtime configuration.
- Confirm child orchestration is explicitly enabled only for the intended environment.
- Confirm the operator has a valid local-control key.
- Confirm child capability dry-runs, approvals, and runs will remain separately governed.

## Guided Operation

1. Open Dashboard `#/workflows`.
2. Use the `Recovery Guided Operation` panel.
3. Select one of the supported templates.
4. Enter the local-control key. The UI should show only `entered` or `missing`.
5. Create the recovery dry-run.
6. Request workflow recovery approval.
7. Approve only the workflow recovery request.
8. Start the recovery run.
9. If the run waits for child approval, stop and resolve the child approval through the child control plane.
10. Resume recovery only after child approvals and child records are ready.

## Do Not Do

- Do not use the Dashboard to approve child actions.
- Do not send raw paths, bodies, prompts, diffs, PR markdown, tokens, cookies, sessions, or env values.
- Do not bypass child control planes.
- Do not push, merge, force, update refs, comment, label, request reviewers, create releases, or create deployments.


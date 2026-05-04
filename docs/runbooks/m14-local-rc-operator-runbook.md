# M14 Local RC Operator Runbook

## Purpose

M14 gives an operator a local-only release candidate loop:

1. Review M12 patch lifecycle and M13 review package metadata.
2. Check local RC readiness.
3. Optionally export a governed local RC bundle after approval.
4. Rehearse local acceptance with fixture scenarios.
5. Inspect Dashboard/CLI read-only RC summaries.

The loop does not push, open a pull request, call GitHub, read account tokens, deploy, connect Browser/Electron/MCP execution surfaces, or create remote release artifacts.

## Readiness Checks

Use the CLI read-only views:

```bash
codexhub release-candidates readiness --json
codexhub release-candidates runs list --json
codexhub release-candidates acceptance show --json
```

Use the Dashboard route:

```text
#/release-candidates
```

The page shows local RC readiness, RC bundle run metadata, review package state, acceptance rehearsal, and boundary booleans. It has no execute button, no approve button, and no local-control key input.

## Governed Export Flow

Local RC bundle export is disabled by default. When an operator explicitly enables it for a local session:

- `CODEXHUB_RELEASE_CANDIDATE_EXPORT_ENABLED=true` must be set.
- Supervisor POST routes must pass trusted loopback Origin and local-control key gates.
- Dry-run must be persisted in the Supervisor store.
- Approval must be persisted, approved, unused, unexpired, and store-resolved.
- Runtime artifact root must hash-match the persisted dry-run.
- Output must remain fixed summary JSON/Markdown files under the sibling artifact root.

Never pass full approval artifacts or execution authority objects in request bodies.

## Acceptance Rehearsal

Run fixture-only rehearsals before relying on a local RC:

```bash
codexhub release-candidates rehearse --fixture --scenario all-pass --json
codexhub release-candidates rehearse --fixture --scenario verification-blocked --json
codexhub release-candidates rehearse --fixture --scenario review-blocked --json
```

Supported scenarios are `all-pass`, `review-blocked`, `verification-blocked`, `readiness-blocked`, `export-blocked`, and `superseded-package`.

The rehearsal does not export files, start processes, call network services, push, or open a pull request.

## Failure Handling

- `blocked_review`: inspect review package decision metadata and findings count.
- `blocked_verification`: inspect M12 verification readiness and Nx result summaries.
- `blocked_operator_readiness`: run `codexhub doctor --json` and resolve blockers.
- `export-blocked`: inspect dry-run, approval, env flag, and hash-binding metadata.
- `superseded-package`: generate or select a current local review package before RC acceptance.

## Rollback

- Disable `CODEXHUB_RELEASE_CANDIDATE_EXPORT_ENABLED`.
- Keep read-only Dashboard/CLI views available for inspection.
- Do not manually delete artifacts unless the operator has independently verified the path and contents.
- Remove local artifact directories only through a separately reviewed cleanup process if that process is later added.

## Safety Notes

- Raw diff, PR body, review reason, path body, command body, env value, token, cookie, session, and body content must not be stored in public responses.
- Capability providers are not authority providers. RC export must remain governed by CodexHub policy, approval, evidence, and audit.
- M14 is local-only. Remote release, GitHub, push, PR creation, tags, deployments, and account integrations remain out of scope.

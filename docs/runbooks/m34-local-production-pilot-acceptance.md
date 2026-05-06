# M34 Local Production Pilot Acceptance

## CLI Smoke

Run the read-only acceptance commands:

```text
codexhub workflows production local-pilot readiness --json
codexhub workflows production local-pilot rehearse --fixture --scenario all-pass --json
codexhub workflows production local-pilot rehearse --fixture --scenario nx-failed --json
codexhub workflows production local-pilot runs list --json
```

Use `codexhub approvals decide` only for existing approval requests. Do not pass tokens as command arguments; the CLI reads the local-control token only from the operator environment for the governed decision command.

## Dashboard Smoke

Open `#/workflows` and confirm:

- Local pilot gate is visible.
- Recovery wizard stores the local-control key only in page memory.
- Child approval waits are visible.
- No child approval button is shown.
- No adapter execution control is present.

## Pass Criteria

- `all-pass` completes as metadata-only fixture rehearsal.
- `nx-failed` does not proceed to review package export.
- Public output contains no raw prompt, stdout, stderr, diff, path, URL, body, file content, token, cookie, session, env value, request body, or response body.

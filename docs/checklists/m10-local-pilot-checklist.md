# M10 Local Pilot Checklist

## Required Read-Only Checks

- [ ] `codexhub doctor` reports no failed required checks.
- [ ] `codexhub pilot m10 checklist` has no blocked required step.
- [ ] Local-control key state is shown only as configured, missing, or hash.
- [ ] Worktree manager remains disabled by default until explicitly enabled.
- [ ] Approval inbox has a persisted record before any later live pilot attempt.
- [ ] Codex pilot mode remains dry-run/read-only.
- [ ] Nx verification targets remain allowlisted.
- [ ] Governance projection can show run, evidence, and audit metadata.
- [ ] Rollback notes are available before enabling any later live pilot.

## Must Stay False In M10a

- Dashboard POST from `#/pilot`
- CLI POST from `codexhub pilot m10`
- local-control token read by M10 read-only CLI commands
- local-control token stored by Dashboard
- adapter `execute()` called by Dashboard or CLI
- new process boundary
- new network boundary
- push
- open PR

## Metadata-Only Output

M10a output may include ids, hashes, counts, statuses, summaries, evidence ids, and audit ids.
It must not include raw token, environment value, path, prompt, stdout, stderr, diff, request body, response body, cookie, or session data.

# M12 Controlled Patch Results

## Status

M12 delivers a governed local patch lifecycle from fixture foundation through draft-only readiness and retry/cleanup handoff projection.

## Capability Matrix

| Slice | Status | Boundary | Approval | Output |
| --- | --- | --- | --- | --- |
| M12a controlled patch fixture | Complete | None | Not required | Patch lifecycle fixtures, hashes, counts, statuses |
| M12b governed Codex patch in worktree | Complete | Existing Codex boundary only | Required | Isolated-worktree patch metadata, diff hash, evidence/audit ids |
| M12c verification readiness gate | Complete | Existing Nx boundary projection | Required by upstream execution | Draft readiness only after passed verification |
| M12d retry cleanup lifecycle | Complete | None | New approval required for real retry/cleanup | Retry reason hash, last safe step, cleanup readiness metadata |
| M12.5 hardening review | Complete | None | No new authority | Schema hardening, review evidence, release baseline |

## Safety Invariants

- Codex patch writes are limited to the approved isolated worktree.
- Repository root writes remain forbidden.
- Push and remote pull request creation remain forbidden.
- PR draft readiness is local metadata only and requires passed verification.
- Raw prompt, stdout, stderr, diff body, PR body, command body, path body, token, cookie, session, and local-control key data are not stored.
- Retry requires a new approval; cleanup remains non-force and governed.
- Dirty worktrees block cleanup readiness and record only dirty count/hash metadata.

## Release Acceptance

- Contracts reject raw M12 patch lifecycle metadata.
- Orchestrator helpers preserve no-push and no-PR booleans.
- Failed or aborted verification cannot produce draft-ready status.
- Terminal patch lifecycles cannot expose retry or cleanup handoff state.
- M12.5 adds no new route, process boundary, network boundary, Dashboard write UI, CLI write command, MCP tool, Browser/Electron surface, push, or PR creation.

## Rollback

Rollback can revert M12.5 schema hardening and docs without affecting M12a-M12d behavior. If rolling back the entire M12 capability, remove the controlled patch contracts and orchestrator helpers, then remove the M12 release registrations from scaffold health, orchestration, and integrations config.

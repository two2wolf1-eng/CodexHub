# M12c Patch Verification Readiness Gate

## Status

M12c adds the local governance projection that turns an isolated-worktree Codex patch into a draft-ready patch only after Nx affected verification passes.

## Delivered Scope

- Added `ControlledPatchVerificationGate` to describe the Nx verification gate using ids, hashes, counts, statuses, summaries, evidence refs, and audit ids only.
- Added an orchestrator helper that composes M12b governed Codex patch metadata with verification results.
- Preserved the M12 rule that failed, aborted, blocked, or missing verification cannot produce `ready_for_review_draft_only`.
- Kept PR behavior local and metadata-only: no push, no remote PR, and no raw PR body.

## Safety Invariants

- Raw prompt, stdout, stderr, diff, path, command output, token, cookie, session, and body content are not persisted.
- Verification output is summarized through hashes and counts only.
- The helper does not introduce a new process boundary or route; it records the existing Nx verification boundary truth supplied by the caller.
- `ready_for_review_draft_only` requires changed files plus passed verification.

## Rollback

Remove the M12c orchestrator helper, the `ControlledPatchVerificationGate` contract, and this release registration. M12b remains valid with patch metadata ending at `not_ready_pending_verification`.

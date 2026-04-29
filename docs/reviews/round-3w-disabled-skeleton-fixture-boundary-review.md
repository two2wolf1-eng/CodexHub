# Round 3W Disabled Skeleton and Fixture-backed Replay Boundary Review

## Executive Summary

Round 3T-W adds a disabled read-only adapter skeleton, a non-executing skeleton review, a fixture-backed replay boundary, and a final readiness record. The result is still a no-live control-plane workflow.

## Phase A: Disabled Skeleton

The skeleton preview is disabled by default and stores no runnable command, argument array, executable path, shell snippet, or environment plan. It only reports disabled or blocked status and no-live flags.

## Phase B: Skeleton Review

The skeleton review records whether the disabled skeleton is acceptable for a fixture-backed replay boundary only. The positive outcome is `skeleton_accepted_for_fixture_boundary_only`; it is not process adapter approval and does not grant execution.

## Phase C: Fixture-backed Replay Boundary

The fixture-backed replay boundary reads only synthetic JSONL fixtures from the approved Codex fixture directory. Path guards reject absolute paths, traversal, non-JSONL paths, paths outside the fixture root, and missing files with safe errors. It reuses the JSONL parser and stores only summaries, hashes, counts, evidence refs, and audit ids.

## Phase D: Final Readiness

The final readiness record can say that a separate future ADR may be considered. It cannot approve process start, a real Codex call, workspace writes, Dashboard triggers, or any live adapter implementation.

## No-live Confirmation

- No `node:child_process` import is added.
- No process start path is added.
- No real Codex call is added.
- No workspace write path is added.
- Dashboard remains read-only and has no trigger controls.
- Recommendations remain governance guidance only.

## Open Risks

- A real read-only adapter still needs a separate ADR and go/no-go review.
- Disabled skeleton behavior must remain blocked by default in every future change.
- Fixture boundary must continue to use only synthetic local fixtures and safe path guards.

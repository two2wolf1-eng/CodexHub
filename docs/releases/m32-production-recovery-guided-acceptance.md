# M32 Production Recovery Guided Acceptance

## Summary

M32 hardens the M31 guided operation by adding acceptance coverage for local and remote recovery templates, static audit checks, and release closeout documentation.

## Acceptance Matrix

| Scenario | Expected Result |
| --- | --- |
| all-pass-local | Recovery can proceed through workflow approval and child wait/resume metadata. |
| all-pass-remote | Remote recovery remains on existing GitHub child control planes. |
| token-missing | Dashboard blocks before POST. |
| token-bad | Supervisor rejects the request. |
| recovery-disabled | Dry-run is blocked before child work. |
| child-orchestration-disabled | Recovery run blocks before child orchestration. |
| workflow-approval-blocked | Run does not start. |
| child-approval-wait | Run pauses and does not auto-approve child actions. |
| child-run-failed | Later steps remain blocked. |
| branch-publish-failed | Draft PR creation is skipped. |
| draft-pr-failed | Recovery metadata is recorded; no cleanup is automatic. |
| remote-cleanup-blocked | Cleanup remains separately approved. |
| resume-after-child-approval | Run resumes from last safe metadata step. |

## Result

The guided operation is accepted as an operator-facing recovery entry point with a narrow Dashboard mutation surface. CLI remains read-only.


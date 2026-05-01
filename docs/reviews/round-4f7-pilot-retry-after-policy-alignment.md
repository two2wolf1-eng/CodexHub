# Round 4F.7: Pilot Retry After Policy Alignment

## Status

Round 4F.7 executed exactly one controlled CLI-only read-only adapter attempt after Round 4F.6 aligned the pilot policy decision source.

Outcome:

`pilot_retry_blocked_before_boundary`

This is an authoritative safety block, not a completed pilot and not an MVP success signal.

## Source References

| Artifact | Value |
| --- | --- |
| Policy alignment commit | `74013bf chore: align read-only adapter policy decision source` |
| Approval binding fix commit | `5834ecb chore: fix read-only adapter policy approval binding` |
| dryRunId | `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7` |
| Policy source record | `codex_real_read_only_adapter_policy_source_35a9f5de-a23e-4340-a358-9d95c40452a0` |
| Policy source status | `aligned` |
| Policy decision outcome | `approval_required` |
| Policy decision hash | `sha256:c86aba085a8a627c82de42abd6964a13e5d25e275b2e595e7f33daea4ae77a00` |
| Approval artifact | `codex_approval_artifact_a74ab45f-1303-4d5a-a849-9c7bdbbae1e9` |
| Source preparation record | `codex_real_read_only_adapter_pilot_source_preparation_12c88871-e0c9-4d3c-9bea-692f115d2b68` |
| Prerequisite record | `codex_real_read_only_adapter_pilot_prerequisite_78129b25-bcc0-4990-9c4a-0fb870840d10` |
| Prerequisite status | `ready_for_pilot_retry` |
| Worktree label | `round-4f-pilot-c0fc119` |
| Worktree status | `clean` |
| Worktree path hash | `sha256:0affb4c5187a9fe16dc3516a77d2ed79b49d6d92dc66aec7e6264d17e124dbf5` |

No raw absolute worktree path is recorded in this review.

## Attempt Result

| Field | Value |
| --- | --- |
| attemptId | `codex_real_read_only_adapter_attempt_6b618c1d-3aa0-455c-bcc7-ff0b842ef9ea` |
| status | `blocked` |
| authoritative | `true` |
| supervisorBacked | `true` |
| persisted | `true` |
| degraded | `false` |
| notPersisted | `false` |
| processBoundaryInvoked | `false` |
| preflightStatus | `failed` |
| resultStatus | `blocked` |
| resultErrorCode | `worktree_not_isolated` |
| failedCheckCodes | `isolated_worktree_clean` |
| blockedCheckCodes | none |
| postRunVerificationStatus | `not_required` |
| evidenceRefIds | `evidence_e3f67c44-2dd6-4e4f-b49a-6d64a638bb48` |
| auditEventIds | `audit_c72dccdc-cb63-43c8-b56a-58874a88a25f`, `audit_3cc1e978-367a-4b4b-8363-a490c905b8bd` |
| metadataHash | `sha256:a7ef1c369f257440291c7108e524534921abbe3bcf6738ae6e16a99a8b7b507c` |

The policy blocker from Round 4F.5 did not recur. The attempt moved to the next guard and failed closed on worktree isolation metadata.

## Timeline Readback

| Field | Value |
| --- | --- |
| timelineId | `codex_real_read_only_adapter_attempt_timeline_59412b71-137f-459d-9f66-1a9d806f9b90` |
| latest timeline entry | `codex_real_read_only_adapter_attempt_timeline_entry_a1f643d9-9b24-4345-ae22-76e0cd090b2e` |
| eventCount | `4` |
| evidenceRefCount | `4` |
| auditEventCount | `8` |
| processBoundaryInvokedCount | `0` |
| verificationSummary | `No completed post-run verification metadata is available for the filtered attempts.` |
| workspaceMutationSummary | `Workspace mutation remains forbidden; any unexpected diff is critical and requires manual review.` |

## Metadata-Only Readback

Readback checks confirmed:

- the latest attempt output did not contain the raw runtime worktree path;
- the timeline output did not contain the raw runtime worktree path;
- neither latest attempt nor timeline output contained `executablePath` or `argv` fields;
- `promptBodyStored`, `commandBodyStored`, `stdoutBodyStored`, and `stderrBodyStored` were not true in latest attempt or timeline output.

## Safety Boundary Confirmation

| Boundary | Result |
| --- | --- |
| Dashboard trigger | forbidden |
| workspace_write | forbidden |
| danger_full_access | forbidden |
| browser/CDP/Profile/Workspace/account automation | forbidden |
| raw prompt body persistence | false |
| raw command body persistence | false |
| raw stdout/stderr body persistence | false |
| raw absolute worktree path persistence | false |
| fallback used as authority | false |
| process boundary outside approved module | not observed |
| broader autonomous use | not approved |

## Evidence Table

| Check | Evidence source | Result | Decision |
| --- | --- | --- | --- |
| Policy source aligned | `policy-sources prepare` | `status=aligned`, `degraded=false`, `notPersisted=false` | Continue |
| Approval binding aligned | Supervisor approval request and manual approval | artifact `codex_approval_artifact_a74ab45f-1303-4d5a-a849-9c7bdbbae1e9`, policy hash matched aligned source | Continue |
| Prerequisite readiness | `pilot-prerequisites check` | `ready_for_pilot_retry`, `degraded=false`, `notPersisted=false` | Continue |
| Single retry attempted | CLI attempt path | one attempt created: `codex_real_read_only_adapter_attempt_6b618c1d-3aa0-455c-bcc7-ff0b842ef9ea` | Continue to review |
| Process boundary | attempt readback | `processBoundaryInvoked=false` | Release blocker |
| Guard result | attempt readback | `resultErrorCode=worktree_not_isolated`, `failedCheckCodes=isolated_worktree_clean` | Requires 4G.3 review |
| Metadata-only readback | latest/timeline content checks | no raw worktree path, argv, executable path, or body-stored true flags | Continue |

## Operator Observation

Round 4F.7 confirmed the policy decision source remediation worked: the attempt no longer failed on `policy_decision_exists`. The next blocker is worktree isolation recognition in the actual attempt preflight. Because `processBoundaryInvoked=false`, this is not a successful pilot and does not support an MVP Go decision.

## Next Round

Round 4G.3 may be considered to review this authoritative blocked result.

Round 4H.2 remains blocked until the pilot review determines whether this block is a release blocker and whether additional remediation is required.

# Round 4F.15 Pilot Retry After Boundary Diagnostics Remediation

## Round

Round 4F.15: Pilot Retry After Boundary Diagnostics Remediation.

## Phase Lock

- Allowed files/directories: this review document only.
- Forbidden files/directories: production packages, apps, Dashboard, store schema, tools, config, and runtime worktree state.
- Expected tests: focused `codex-kernel`, Supervisor, CLI checks, boundary audit, no-live audit, foundation verification, and full verification before commit.
- Expected output: one authoritative pilot retry result record and this metadata-only review.

## Mini GSD

- Goal: run one controlled CLI-only read-only retry after 4F.14 boundary diagnostic remediation, then document whether the attempt completed or produced complete metadata-only boundary diagnostics.
- Scope: one retry using the known dry-run, one valid Supervisor-backed approval artifact, isolated clean worktree runtime input, and authoritative attempt/latest/timeline readback.
- Non-scope: no second retry, no production code change, no Dashboard trigger, no workspace write, no danger full access, no browser/CDP/Profile/Workspace/account automation, and no broader autonomous use approval.
- Acceptance criteria: latest prerequisite is ready, exact approval authority passes, one attempt is created, attempt/latest/timeline readback exists, metadata-only checks remain intact, focused/full verification pass, and the round is committed.
- Hard boundaries: raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw absolute worktree path are not persisted or documented.
- Affected apps/packages: no source package changed in this round; CLI and Supervisor were exercised through existing public commands.
- Risk level: high, because this round invoked the approved read-only adapter attempt path once.

## Skills Used

- Workflow skills: `gsd-spec-driver`, `gstack-delivery-workflow`, and `superpowers-engineering-discipline` were read for the round structure, gated delivery flow, and evidence-over-claims closeout.
- Project skills: `codexhub-architecture-planner`, `codexhub-codex-exec-adapter`, `codexhub-workflow-policy-reviewer`, `codexhub-contract-designer`, and `codexhub-release-auditor` were used because the round exercised adapter, approval, policy, evidence, audit, and package-boundary behavior.
- Not used: `codexhub-playwright-qa`, `codexhub-electron-cdp-observer`, and `codexhub-browser-profile-observer`; this round did not touch Dashboard UI, Electron/CDP, Chrome Profile, or ChatGPT Workspace automation.

## Preflight

- Starting commit: `8f557db chore: remediate read-only adapter boundary diagnostics`.
- Git state before the round: clean.
- Preflight checks run before the retry: `audit:skills`, `audit:no-live-automation`, `audit:boundaries`, `audit:sqlite-isolation`, `tools/audit-real-adapter-boundary.ts`, and `verify:foundation`.
- Config state: loaded from `.codexhub/codex-exec.yaml`, `liveEnabled=true`, `allowedSandboxModes=[read_only]`, `workspace_write` forbidden, and `danger_full_access` forbidden.
- Supervisor state: local Supervisor health check returned healthy for control-plane validation.

## Gate Refresh

- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Latest policy-source record: `codex_real_read_only_adapter_policy_source_35a9f5de-a23e-4340-a358-9d95c40452a0`
- Policy decision hash: `sha256:c86aba085a8a627c82de42abd6964a13e5d25e275b2e595e7f33daea4ae77a00`
- Dry-run plan hash: `sha256:fae77dec23facbffaf8b5803e79ac23cbc4ffbd42a2d0f4b92da5f4584e528e7`
- Worktree metadata: label `round-4f-pilot-c0fc119`, status `clean`, hash `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`.
- Runtime worktree path handling: the path was used only as CLI runtime input for hash comparison; the raw absolute path is not recorded in this document.
- Main repo and isolated pilot worktree were both clean before and after the retry.

## Approval Freshness

The approval artifact from the previous retry no longer passed source-prep refresh. The refresh failed only on `valid_unused_approval`, so 4F.15 used its one allowed replacement approval path through the existing Supervisor-backed governance flow.

- Replacement approval request id: `codex_approval_request_43753cce-2847-4542-af79-ec2489363bec`
- Replacement approval record id: `codex_approval_record_b3936254-2671-418d-8d30-79f587bc11b1`
- Replacement approval artifact id: `codex_approval_artifact_3e754da8-d63b-4a34-b1ea-c43fabf7376a`
- Approval status: `approved`
- Dry-run plan hash match: `true`
- Policy decision hash match: `true`
- Approval degraded: `false`

## Final Prerequisite Record

After the replacement approval was created through Supervisor, source-prep and prerequisite readiness were refreshed serially.

- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_927df5e3-4ab9-441a-b3e3-ad0930a64fc9`
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_16b82eaa-e420-4980-8983-5d03825564e5`
- Prerequisite status: `ready_for_pilot_retry`
- Degraded / notPersisted / fallback authority: `false` / `false` / `false`
- Valid unused approval present: `true`
- Authoritative source preparation present: `true`
- Authoritative policy source present: `true`
- Isolated clean worktree metadata present: `true`
- Evidence/audit ready: `true`
- Pilot executed before start: `false`
- Adapter attempt invoked before start: `false`

## Pilot Retry Result

Exactly one CLI-only retry was run. The command used the approved dry-run id, replacement approval artifact id, and runtime worktree input; no prompt body, raw command body, Dashboard input, browser/CDP/Profile/Workspace input, or fallback authority was passed.

- Attempt id: `codex_real_read_only_adapter_attempt_b77e7190-6d19-48df-9fac-7c0c2bd6795b`
- Status: `failed`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: not reported in attempt readback for this boundary failure.
- Failed check codes: none.
- Blocked check codes: none.
- Process boundary invoked: `true`
- Process boundary module: `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- Post-run verification status: `skipped`; nested evidence/audit metadata marked the failed path as aborted because the boundary result failed.
- Workspace mutation detected: `false`
- Output hash count: `2`
- Metadata hash: `sha256:64a28ca4f29b7b0bec762073ac36ca2d9dca108b9eb75a48b6752f8df9d47df3`

## Boundary Diagnostics Readback

4F.15 confirmed boundary invocation after the 4F.14 diagnostic remediation, but the persisted attempt/latest/timeline readback still does not expose the complete boundary diagnostic fields required for release review.

- Normalized failure code: not present in attempt readback.
- Exit code: not present in attempt readback.
- Signal: not present in attempt readback.
- Duration: not present in attempt readback.
- Timeout flag: not present in attempt readback.
- Cancel flag: not present in attempt readback.
- stdout/stderr hashes: not present as attempt-level diagnostic fields; the evidence summary reports `outputHashCount=2`.
- stdout/stderr byte counts: not present in attempt readback.
- stdout/stderr line counts: not present in attempt readback.
- stdout/stderr truncation flags: not present in attempt readback.
- Post-run verification skip reason: not present as a stable attempt-level field.

This means 4F.15 produced safe metadata-only failure evidence, but it did not prove that 4F.14 fully closed the diagnostic-readback gap.

## Evidence, Audit, And Timeline

- Evidence summary id: `codex_real_read_only_adapter_evidence_summary_3f4b60f5-f584-4f8b-af2d-53e3dd842f79`
- Evidence refs: `evidence_44f98588-a7f7-4924-8dae-9b7d632fe566`, `evidence_dac6d353-389d-4cf6-8ce2-7ea324305b0d`
- Evidence event hash count: `15`
- Evidence output hash count: `2`
- Audit summary id: `codex_real_read_only_adapter_audit_summary_1a9fed6b-8176-4e05-9585-edd993f3021b`
- Audit refs: `audit_0552239e-c992-470e-bc8d-5dc6d266607f`, `audit_20c2cb5a-06e9-4963-844d-16418909bdb5`
- Audit event count: `2`
- Audit actions: `codex.exec.real_read_only_adapter.before_boundary`, `codex.exec.real_read_only_adapter.failure`
- Timeline id from 4F.15 readback snapshot: `codex_real_read_only_adapter_attempt_timeline_2745999d-24a7-4e9a-a5a5-7d99311dc4f4`
- Latest timeline entry id from 4F.15 readback snapshot: `codex_real_read_only_adapter_attempt_timeline_entry_339b224a-131b-4ed5-93bd-8938c65d918e`
- Timeline status: `failed`
- Timeline entry count: `8`

## Interpretation

4F.15 verified that the approval, policy, config, worktree, evidence, and audit gates can again reach the approved process boundary. The attempt failed after boundary invocation, so this is not a completed pilot.

The new diagnostic remediation is only partially visible in authoritative readback. The stored records preserve metadata-only safety and evidence/audit refs, but the attempt and timeline summaries still do not expose the normalized boundary failure details needed to diagnose the failure without code-level inspection. This remains a release blocker.

## Metadata-Only Review

- Raw runtime worktree path: not documented here and not found in attempt/latest/timeline readback.
- Raw prompt body: not persisted; prompt body storage flags remain false.
- Raw command body: not persisted; command body storage flags remain false.
- Raw stdout/stderr body: not persisted; stdout/stderr body storage flags remain false.
- Raw agent/reasoning body: not persisted; agent and reasoning body storage flags remain false.
- Raw argv, executable path, and env plan: not present in readback scans.
- Worktree metadata persisted only as label, status, and hash.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| 4F.14 gate | `git log --oneline -5` before 4F.15 | Latest remediation commit was `8f557db chore: remediate read-only adapter boundary diagnostics` | 4F.15 allowed to proceed |
| Preflight | Audit and foundation commands before retry | Skills, no-live, boundaries, SQLite, process-boundary audit, and foundation checks passed | Retry gate remained open |
| Config | CLI config/readiness readback | `liveEnabled=true`, `read_only` only, `workspace_write` and `danger_full_access` forbidden | Config accepted |
| Previous approval | Source-prep refresh | Previous approval failed `valid_unused_approval` | One replacement approval allowed |
| Replacement approval | Supervisor approval request/manual approval flow | Approval `codex_approval_artifact_3e754da8-d63b-4a34-b1ea-c43fabf7376a` created, approved, and hash-bound | Replacement accepted |
| Final prerequisite | CLI prerequisite check | Record `codex_real_read_only_adapter_pilot_prerequisite_16b82eaa-e420-4980-8983-5d03825564e5`, `ready_for_pilot_retry`, persisted and non-degraded | Single retry allowed |
| Worktree isolation | Git worktree and status checks | Main repo and pilot worktree clean; sanitized worktree hash accepted by source-prep/readiness | Runtime worktree input allowed |
| Single retry | CLI attempt output and latest readback | Attempt `codex_real_read_only_adapter_attempt_b77e7190-6d19-48df-9fac-7c0c2bd6795b` created | No second retry allowed |
| Attempt authority | Attempt get/latest readback | Authoritative, Supervisor-backed, persisted, non-degraded | Record accepted |
| Boundary result | Attempt readback | `processBoundaryInvoked=true`, `resultStatus=failed`, post-run verification skipped | 4G.7 may review; MVP gate remains blocked |
| Diagnostics | Attempt/latest/timeline readback scan | Boundary failure code, exit code, signal, duration, timeout/cancel flags, stdout/stderr hash/count fields, and skip reason are not exposed as stable readback fields | Diagnostic blocker remains |
| Timeline | CLI timeline readback | Timeline status `failed`; latest entry references the 4F.15 attempt | Timeline accepted |
| Metadata-only | Attempt/latest/timeline readback scan | Raw worktree path, raw body storage, argv, executable path, and env plan were not found | Boundary held |

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- 4F.15 did not approve MVP use.

## Round Decision

Outcome: `pilot_retry_boundary_exercised_with_failure_diagnostic_gap`.

4G.7 may be considered because an authoritative, persisted retry result exists and the process boundary was exercised with metadata-only evidence/audit/timeline readback. 4H.5 remains blocked because the attempt did not complete, post-run verification did not complete, and boundary failure diagnostics are still not fully exposed in persisted readback.

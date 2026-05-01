# Round 4F.13 Pilot Retry After Approval Alignment

## Round

Round 4F.13: Pilot Retry After Approval Alignment.

## Phase Lock

- Allowed files/directories: this review document only.
- Forbidden files/directories: production packages, apps, Dashboard, store schema, tools, config, and approval state, except one replacement approval created through the existing Supervisor-backed governance flow when the previous approval failed freshness checks.
- Expected tests: focused `codex-kernel`, Supervisor, CLI checks, boundary audit, no-live audit, foundation verification, and full verification before commit.
- Expected output: one authoritative pilot retry result record and this metadata-only review.

## Mini GSD

- Goal: run one controlled CLI-only read-only retry after 4F.12 approval authority alignment, then document whether the split between readiness approval and attempt preflight approval is resolved.
- Scope: one retry using the known dry-run, a valid Supervisor-backed approval artifact, isolated clean worktree runtime input, and authoritative attempt/timeline readback.
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

- Starting commit: `73e27a2 chore: align read-only adapter approval authority`.
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
- Main repo and isolated pilot worktree were both clean before the retry.

## Approval Freshness

The previous approval artifact `codex_approval_artifact_fce8988c-b37b-45ae-a5cb-93c426d733bc` no longer passed the source-prep/prerequisite refresh. Both refreshed records failed only on `valid_unused_approval`, so 4F.13 used its one allowed replacement approval path.

- Replacement approval request id: `codex_approval_request_7fa72ad4-e79f-44d3-97ca-07d9c6a052c6`
- Replacement approval record id: `codex_approval_record_e6fe1fea-b12f-4ae8-92af-26e251821035`
- Replacement approval artifact id: `codex_approval_artifact_ce970341-ba81-45c5-8422-07eee7c9f816`
- Approval status: `approved`
- Dry-run plan hash match: `true`
- Policy decision hash match: `true`
- Approval degraded: `false`

## Final Prerequisite Record

After the replacement approval was created through Supervisor, source-prep and prerequisite readiness were refreshed serially.

- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_1763a484-4a32-43ea-948c-354e1f127965`
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_4cf7505c-3da1-45ea-be5c-f3f21f2bee57`
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

- Attempt id: `codex_real_read_only_adapter_attempt_8209e010-dbf8-43bc-bf05-c7f998d1be75`
- Status: `failed`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: not reported in attempt summary for this boundary failure.
- Failed check codes: none.
- Blocked check codes: none.
- Process boundary invoked: `true`
- Process boundary module: `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- Boundary status: `failed`
- Boundary timed out: `false`
- Boundary cancelled: `false`
- Post-run verification status: `skipped`; nested evidence metadata also marks the post-run verification path as aborted because the boundary result failed.
- Workspace mutation detected: `false`
- Output hash count: `2`
- Metadata hash: `sha256:3ed60b4962bf98f6df6a3b585c81a33b14e4ac3490d69c9718e48fc65bf750b1`

## Evidence, Audit, And Timeline

- Evidence summary id: `codex_real_read_only_adapter_evidence_summary_af8b0a1a-c39e-4bce-a89a-4a4a96ad8c43`
- Evidence refs: `evidence_c30f614f-a325-4d36-af3f-b65150f32522`, `evidence_010fbd09-eafb-41d6-8038-9c5fd8fda6ef`
- Evidence event hash count: `15`
- Evidence output hash count: `2`
- Audit summary id: `codex_real_read_only_adapter_audit_summary_d8b39913-4d26-43a6-bccc-0e9fcc26a823`
- Audit refs: `audit_a47c076e-62ee-459c-914e-79df8731e844`, `audit_02d49125-c8d9-4c66-908e-f46c3f8a39d8`
- Audit event count: `2`
- Audit actions: `codex.exec.real_read_only_adapter.before_boundary`, `codex.exec.real_read_only_adapter.failure`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_c5fa56ca-6881-46ac-86ed-b314d5276357`
- Timeline status: `failed`
- Latest timeline entry id: `codex_real_read_only_adapter_attempt_timeline_entry_832de4fe-244b-4ae7-a78f-f1db66ba14c9`
- Timeline entry count: `7`

## Interpretation

4F.13 resolved the 4F.11 approval-authority split. The exact approval artifact was accepted by source-prep, prerequisite readiness, and actual attempt preflight. The attempt no longer failed on `missing_approval`, `approval_artifact_exists`, `dry_run_hash_match`, or `policy_hash_match`.

The retry reached the approved process boundary and failed there. This is progress from pre-boundary approval failure to boundary-exercised failure, but it is not a successful pilot. Because the attempt did not complete and post-run verification did not complete, 4H.5 remains blocked until a later review and remediation path.

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
| 4F.12 gate | `git log --oneline -5` before 4F.13 | Latest remediation commit was `73e27a2 chore: align read-only adapter approval authority` | 4F.13 allowed to proceed |
| Preflight | Audit and foundation commands before retry | Skills, no-live, boundaries, SQLite, process-boundary audit, and foundation checks passed | Retry gate remained open |
| Config | CLI config readback | `liveEnabled=true`, `read_only` only, `workspace_write` and `danger_full_access` forbidden | Config accepted |
| Previous approval | Source-prep/prerequisite refresh | Previous approval failed `valid_unused_approval` | One replacement approval allowed |
| Replacement approval | Supervisor approval request/manual approval flow | Approval `codex_approval_artifact_ce970341-ba81-45c5-8422-07eee7c9f816` created, approved, and hash-bound | Replacement accepted |
| Final prerequisite | CLI prerequisite check | Record `codex_real_read_only_adapter_pilot_prerequisite_4cf7505c-3da1-45ea-be5c-f3f21f2bee57`, `ready_for_pilot_retry`, persisted and non-degraded | Single retry allowed |
| Worktree isolation | Git worktree and status checks | Main repo and pilot worktree clean; persisted hash matched runtime hash | Runtime worktree input allowed |
| Single retry | CLI attempt output | Attempt `codex_real_read_only_adapter_attempt_8209e010-dbf8-43bc-bf05-c7f998d1be75` created | No second retry allowed |
| Attempt authority | Attempt get/latest readback | Authoritative, Supervisor-backed, persisted, non-degraded | Record accepted |
| Boundary result | Attempt readback | `processBoundaryInvoked=true`, `resultStatus=failed`, post-run verification skipped | 4G.6 may review; MVP gate remains blocked |
| Timeline | CLI timeline readback | Timeline `codex_real_read_only_adapter_attempt_timeline_c5fa56ca-6881-46ac-86ed-b314d5276357`, status `failed`, 7 entries | Timeline accepted |
| Metadata-only | Attempt/latest/timeline readback scan | Raw worktree path, raw body storage, argv, executable path, and env plan were not found | Boundary held |

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- 4F.13 did not approve MVP use.

## Round Decision

Outcome: `pilot_retry_boundary_exercised_with_failure`.

4G.6 may be considered because an authoritative, persisted retry result exists and the process boundary was exercised with metadata-only evidence/audit/timeline readback. 4H.5 remains blocked until 4G.6 reviews the failure and a later route resolves or explicitly accepts the remaining release blocker.

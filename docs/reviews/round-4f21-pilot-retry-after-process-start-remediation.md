# Round 4F.21 Pilot Retry After Process Start Remediation

## Round

Round 4F.21: Pilot Retry After Process Start Remediation.

## Status

Outcome: `pilot_retry_boundary_exercised_with_failure`

Round 4F.21 ran exactly one controlled CLI-only read-only retry after 4F.20 remediated the process-start failure class with fake-runner coverage. The retry was authoritative, Supervisor-backed, persisted, non-degraded, and non-fallback. It passed preflight and invoked the approved process boundary, but the boundary still failed with `process_start_failed`. Post-run verification was skipped because the attempt did not complete.

This round did not modify production code, Dashboard, config, store schema, contracts, or tools. It did not add a Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, or broader autonomous-use approval.

## GSD Spec

Goal: run one controlled local read-only retry to verify 4F.20 process-start remediation and collect authoritative attempt evidence for 4G.10 review.

Scope:

- Refresh prerequisite, source-prep, approval, worktree, config, and policy gates.
- Create one replacement approval only because the prior approval was expired.
- Run exactly one CLI-only read-only adapter attempt.
- Read back attempt/latest/timeline records.
- Create this 4F.21 review document.

Non-scope:

- No production code changes.
- No Dashboard code, controls, trigger, or config enablement UI.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, or raw worktree path persistence.
- No retry beyond the single allowed attempt.
- No MVP approval.

Acceptance criteria:

- Starting commit is `c53e3a7 chore: remediate read-only adapter process start failure`.
- Git state is clean before the retry.
- Latest prerequisite is `ready_for_pilot_retry`, persisted, non-degraded, and non-fallback.
- Approval authority trace is aligned.
- Config is explicitly enabled and read-only only.
- Main repo and isolated pilot worktree are clean.
- Runtime worktree path is used only as CLI input and is not persisted or documented.
- Attempt/latest/timeline readback is metadata-only.
- Focused and full verification pass before commit.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Process launch remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- Raw local worktree path, executable path, argv, env values, prompt body, command body, stdout/stderr body, agent body, and reasoning body remain forbidden from persistence.

Affected apps/packages:

- `docs/reviews` only.

Risk level: high. This round performs one controlled local read-only adapter attempt through the approved CLI-only path.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to restate the user-visible objective, exact scope, non-scope, acceptance criteria, boundaries, affected areas, and risk.
- `gstack-delivery-workflow`: used to keep the round ordered as preflight, gate refresh, single retry, readback, docs, verification, and commit.
- `superpowers-engineering-discipline`: used to keep the retry single-shot, evidence-based, and constrained to the approved route.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to preserve package boundaries and avoid Dashboard or broader automation scope.
- `codexhub-codex-exec-adapter`: used because the round exercised the read-only adapter control plane and process boundary.
- `codexhub-workflow-policy-reviewer`: used to verify approval, policy, evidence, audit, and fail-closed behavior.
- `codexhub-contract-designer`: used to confirm the readback uses existing metadata-only contract fields; no contract change was needed.
- `codexhub-release-auditor`: used for verification, evidence review, and the next-round release blocker call.

## Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden and out of scope.

## Preflight

Starting commit:

- `c53e3a7 chore: remediate read-only adapter process start failure`

Preflight before retry:

- `git status --short`: clean
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

Supervisor health was available for control-plane validation.

## Gate Refresh

Known dry-run:

- `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`

Prior prerequisite was ready but referenced an expired approval. 4F.21 created exactly one replacement approval through the Supervisor-backed approval request and manual approval flow.

Replacement approval:

- Approval request id: `codex_approval_request_0d14c6f4-90ef-4274-9c30-3d7a56b1a75f`
- Approval record id: `codex_approval_record_e2391b2b-0613-4849-adfa-0197f28d198a`
- Approval artifact id: `codex_approval_artifact_9de6ee02-5fde-43a1-a6bd-23cf67375774`
- Approval artifact hash: `sha256:6cd370011bc9623a4f640bd79e3ffacc7d41ce009d573fef191fd438e3ee64f2`
- Dry-run plan hash: `sha256:fae77dec23facbffaf8b5803e79ac23cbc4ffbd42a2d0f4b92da5f4584e528e7`
- Policy decision hash: `sha256:c86aba085a8a627c82de42abd6964a13e5d25e275b2e595e7f33daea4ae77a00`
- Expires at: `2026-05-02T03:01:42.183Z`

Refreshed source preparation:

- Source preparation id: `codex_real_read_only_adapter_pilot_source_preparation_96d6af60-d8ed-4803-8526-0fdcfe845be5`
- Status: `prepared`
- Persisted / degraded / notPersisted: `true` / `false` / `false`
- Worktree label: `round-4f-pilot-c0fc119`
- Worktree status: `clean`
- Worktree path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- Evidence ref: `evidence_67cfce1d-553a-49e3-8230-8c1aaf938dd2`
- Audit ref: `audit_codex_real_read_only_adapter_pilot_source_preparation_9265f9ef-e96d-4ec2-af8e-66f7af0c5697`

Refreshed prerequisite:

- Prerequisite id: `codex_real_read_only_adapter_pilot_prerequisite_cc8f8f0a-812c-4629-8bff-b3e1cbbc9f95`
- Status: `ready_for_pilot_retry`
- Hard gates: `9`
- Passed gates: `10`
- Blocked gates: `0`
- Missing prerequisites: `[]`
- Degraded / notPersisted: `false` / `false`
- Config explicitly enabled: `true`
- Valid unused approval present: `true`
- Isolated clean worktree metadata present: `true`
- Authoritative policy source present: `true`
- Authoritative source preparation present: `true`
- Evidence/audit ready: `true`
- Fallback used as authority: `false`
- Pilot executed before start: `false`
- Adapter attempt invoked before start: `false`
- Evidence ref: `evidence_e83bcc08-29d1-4e25-8f32-60e6686d55a4`
- Audit ref: `audit_real_read_only_adapter_pilot_prerequisite_a6621a2a-d09f-4f20-aaee-42280309a155`

Approval authority trace:

- Trace id: `codex_real_read_only_adapter_approval_authority_trace_4f545eae-0786-427e-8d74-ae58b0fe3b27`
- Status: `aligned`
- Exact lookup matched: `true`
- Source-prep matched: `true`
- Prerequisite matched: `true`
- Approval approved / unused / not revoked / not expired: `true` / `true` / `true` / `true`
- Dry-run hash matched: `true`
- Policy hash matched: `true`
- Attempt preflight would accept: `true`
- Degraded / notPersisted / fallback authority: `false` / `false` / `false`
- Evidence ref: `evidence_ec521404-b478-42d4-813f-d28015f1125f`
- Audit ref: `audit_codex_real_read_only_adapter_approval_authority_trace_9f465412-01d4-4914-b668-4f7e26843ddf`

Worktree checks:

- Isolated pilot worktree label: `round-4f-pilot-c0fc119`
- Expected detached HEAD: `c0fc119f10b1b4ba2597662ab8230fdff8974f8e`
- Main repo status before retry: clean
- Pilot worktree status before retry: clean
- Runtime worktree path: used only as CLI input and not persisted or documented.

## Retry Command Summary

One command was run through the CLI-only attempt path:

- Command class: `real-read-only-adapter attempt`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Approval artifact id: `codex_approval_artifact_9de6ee02-5fde-43a1-a6bd-23cf67375774`
- Worktree input: runtime path supplied to CLI only; persisted metadata remains label/hash/status only.
- JSON mode: enabled.

No prompt body, raw command body, Dashboard input, browser/CDP/Profile/Workspace input, fallback authority, or retry was used.

## Attempt Result

- Attempt id: `codex_real_read_only_adapter_attempt_7455f983-adf8-45d7-a5cf-d14c67897e31`
- Request id: `codex_real_read_only_adapter_request_58523c74-3aa2-4fe1-904a-122b239206dc`
- Preflight id: `codex_real_read_only_adapter_preflight_11ea24c8-df65-46ad-bebd-9da33dc8fc08`
- Result id: `codex_real_read_only_adapter_result_0f75d00d-0b94-410d-8f8d-8cff2e45887d`
- Status: `failed`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: `boundary_failed`
- Failed check codes: `[]`
- Blocked check codes: `[]`
- Process boundary invoked: `true`
- Process boundary module: `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- Executable policy label: `codex_cli`
- Executable resolution status: `resolved`
- Executable path stored: `false`
- Env plan stored: `false`
- Argv stored: `false`
- Env allowlist key count: `6`
- Env allowlist key hash: `sha256:4252f6fa07717ed0e3e166e2c1bb317aa7a4ae9f6999051abfcb25e443a214fb`
- Workspace mutation detected: `false`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`

Boundary diagnostics:

- Diagnostics complete: `true`
- Missing diagnostic fields: `[]`
- Boundary status: `failed`
- Normalized failure code: `process_start_failed`
- Timed out: `false`
- Cancelled: `false`
- Duration: `10ms`
- stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- stderr hash: `sha256:9a3d6f9e1de3f32ff898035b65e2d2149fcbf349adad7c2b74a1e1ee414df4d6`
- stdout byte count: `0`
- stderr byte count: `11`
- stdout line count: `0`
- stderr line count: `1`
- stdout truncated: `false`
- stderr truncated: `false`

Evidence and audit:

- Evidence refs: `evidence_2738ef46-37d4-49a6-8efb-1882eb2c356a`, `evidence_bbb60002-4db3-4733-bf78-23ada32aff0a`
- Audit refs: `audit_1ba8320f-41b8-4074-9ef4-8166d72d995b`, `audit_4168d170-cdf9-4636-a97c-2b0b24e19906`
- Output hash count: `2`
- Metadata hash: `sha256:e18a8fca38c08a2c0d9e8e2ca768fefc87eab3d1851e73b4b87fc96a455d4d44`

## Timeline Readback

- Timeline id: `codex_real_read_only_adapter_attempt_timeline_d1ec1105-39ab-4c0b-99c3-6b7d49427b57`
- Timeline status: `failed`
- Timeline event count: `11`
- Timeline evidence ref count: `16`
- Timeline audit event count: `22`
- Timeline output hash count: `10`
- Process boundary invoked count: `5`
- Latest timeline entry id: `codex_real_read_only_adapter_attempt_timeline_entry_ba153cf9-4627-4678-ae29-d784ca74bc9e`
- Latest timeline attempt id: `codex_real_read_only_adapter_attempt_7455f983-adf8-45d7-a5cf-d14c67897e31`
- Latest timeline status: `failed`
- Latest timeline preflight status: `passed`
- Latest timeline result status: `failed`
- Latest timeline result error code: `boundary_failed`
- Latest timeline process boundary invoked: `true`
- Latest timeline diagnostics complete: `true`
- Latest timeline post-run verification status: `skipped`
- Latest timeline post-run verification skip reason: `attempt_not_completed`
- Latest timeline workspace mutation detected: `false`
- Latest timeline evidence ref count: `2`
- Latest timeline audit event count: `2`
- Latest timeline output hash count: `2`

## Metadata-Only Readback Check

Attempt/latest/timeline readback was scanned for forbidden raw material. The scan did not find:

- raw runtime worktree path
- raw main workspace path
- raw executable path or shell shim path
- raw prompt body
- raw command body
- raw stdout/stderr body
- raw agent body
- raw reasoning body

Persisted data remains metadata, ids, hashes, counts, labels, statuses, and storage flags only.

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`

4F.21 confirms that:

- The prerequisite, approval, config, policy, and worktree gates were aligned.
- The approved process boundary was invoked.
- The failure remains `process_start_failed`.
- Boundary diagnostics are complete and metadata-only.
- Workspace mutation was not detected.
- Post-run verification did not run because the attempt did not complete.

This is not MVP success evidence. `4H.6` remains blocked until a later retry completes, post-run verification completes, workspace mutation remains clean, evidence/audit/timeline remain complete, and 4G.10 or a later review records no release blocker.

Next allowed round:

`4G.10 Pilot Review After Process Start Remediation`

## Verification

Focused checks after retry and documentation:

- `pnpm nx test codex-kernel`: passed
- `pnpm nx test supervisor`: passed
- `pnpm nx test cli`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm verify:foundation`: passed
- `git diff --check`: passed

Final verification before commit:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: only this new review doc was present before staging

# Round 4G.8 Pilot Review After Diagnostics Readback Fix

## Round

Round 4G.8: Pilot Review After Diagnostics Readback Fix.

## GSD Spec

Goal: review the authoritative 4F.17 pilot retry result and decide whether it supports an MVP gate retry.

Scope:
- review `docs/reviews/round-4f17-pilot-retry-after-diagnostics-readback-fix.md`
- inspect authoritative attempt/latest/timeline readback from 4F.17
- document release-blocker status and next governance decision

Non-scope:
- no pilot retry
- no adapter attempt invocation
- no production code change
- no Dashboard change or trigger
- no approval creation, renewal, revocation, consumption, or mark-used operation
- no `workspace_write`
- no `danger_full_access`
- no browser/CDP/Profile/Workspace/account automation
- no broader autonomous use approval

Acceptance criteria:
- 4F.17 attempt authority, status, evidence, audit, and timeline refs are reviewed
- metadata-only and no-raw-path/body boundaries are confirmed
- release blocker is clearly classified
- focused docs-only checks and full verification pass before commit

Hard boundaries:
- Dashboard trigger remains forbidden
- `workspace_write` remains forbidden
- `danger_full_access` remains forbidden
- raw prompt, command, stdout, stderr, argv, executable path, env plan, agent body, reasoning body, and raw local worktree path persistence remain forbidden

Affected apps/packages:
- `docs/reviews` only

Risk level: medium. The round is docs-only, but it gates whether an MVP release decision can safely proceed.

## Skills Used

Workflow skills:
- `gsd-spec-driver`: used to restate the review goal, scope, non-scope, boundaries, acceptance criteria, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the review in preflight, inspect, docs, verification, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the review docs-only and evidence-based.

Project skills:
- `codexhub-architecture-planner`: used to confirm no package or app boundary changed in this review.
- `codexhub-codex-exec-adapter`: used to evaluate the adapter attempt result, preflight state, and boundary invocation state.
- `codexhub-workflow-policy-reviewer`: used to review approval, policy, evidence, audit, and release-blocker semantics.
- `codexhub-contract-designer`: used only for readback semantics review; no contracts changed.
- `codexhub-release-auditor`: used for closeout, verification, and commit evidence.

Skills not used:
- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP is out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, and ChatGPT Workspace automation remain forbidden and out of scope.

## 4F.17 Attempt Reviewed

- Attempt id: `codex_real_read_only_adapter_attempt_5ce2ee92-a2e4-4489-b16d-e91971efb681`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Status: `blocked`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Preflight status: `failed`
- Result status: `blocked`
- Result error code: `missing_approval`
- Failed check codes: `approval_artifact_exists`, `approval_artifact_valid`, `dry_run_hash_match`, `policy_hash_match`
- Blocked check codes: none
- Process boundary invoked: `false`
- Post-run verification status: `not_required`
- Evidence refs: `evidence_7de73806-8598-424a-9022-7e99b52797d4`
- Audit refs: `audit_aa3b5fce-16af-48ee-9230-d584b8941195`, `audit_f8ce4e3f-ead2-4368-afd2-4f01d72816a5`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_d189f961-a16a-4ab9-8b39-68718e449a0a`

## Review Findings

4F.17 produced a valid review artifact but not a successful or boundary-exercising pilot result.

The important finding is another authority split:

- source-prep and prerequisite readiness reported `validUnusedApprovalPresent=true`
- the retry used the approval artifact id surfaced by source-prep
- actual attempt preflight rejected the same approval path with `missing_approval`
- hash checks tied to the approval also failed: `dry_run_hash_match` and `policy_hash_match`

This means the release blocker is not diagnostic-readback visibility anymore for this attempt. The blocker has moved back to approval authority alignment between source-prep/prerequisite and actual attempt preflight.

## Evidence, Audit, And Timeline Review

- Evidence exists and is metadata-only.
- Audit exists and records before-boundary plus abort paths.
- Timeline exists and points to the blocked attempt.
- The attempt did not enter the process boundary, so boundary diagnostics and post-run verification were not expected.
- Attempt/latest/timeline readback scan did not find the raw runtime worktree path, raw prompt body, raw command body, raw stdout/stderr body, raw agent/reasoning body, raw argv, executable path, or env plan.

## Release Blocker

Release blocker: `approval_authority_preflight_split`.

Rationale:
- A controlled local MVP cannot be accepted when prerequisite readiness and actual attempt preflight disagree on approval existence/validity and approval-bound hashes.
- The 4F.17 attempt did not complete.
- The 4F.17 attempt did not reach the process boundary.
- Post-run verification did not run because preflight stopped the attempt before boundary.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| 4F.17 commit | `git log --oneline -5` | Latest prior round was `ce784d0 docs: add pilot retry after diagnostics readback fix` | 4G.8 allowed to proceed |
| Preflight | `audit:skills`, `audit:no-live-automation`, `audit:boundaries`, `audit:sqlite-isolation`, process-boundary audit, `verify:foundation` | Passed before writing 4G.8 docs | Review gate open |
| Attempt authority | 4F.17 attempt/latest readback | Authoritative, Supervisor-backed, persisted, non-degraded | Record accepted for review |
| Attempt result | 4F.17 attempt readback | `status=blocked`, `preflightStatus=failed`, `resultErrorCode=missing_approval` | Release blocker |
| Boundary invocation | 4F.17 attempt readback | `processBoundaryInvoked=false` | MVP gate cannot be Go |
| Post-run verification | 4F.17 attempt readback | `not_required` because preflight failed before boundary | MVP gate cannot be Go |
| Evidence/audit/timeline | 4F.17 review and readback | Evidence ref, audit refs, and timeline id present | Sufficient for review |
| Metadata-only boundary | 4F.17 readback scan | No raw runtime path or raw bodies found | Boundary held |

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- No raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, or raw absolute worktree path was persisted by this review.
- Broader autonomous use remains forbidden.

## Outcome

Outcome: `pilot_review_complete_with_approval_release_blocker`.

4H.5 may proceed only as a conservative MVP gate retry. Based on 4G.8 evidence, the expected 4H.5 outcome is `no_go_for_mvp` unless it records the blocker explicitly and refuses local MVP approval.

# Round 4H.16 Read-only Adapter MVP Gate Retry

## GSD Spec

Goal: decide whether the read-only adapter MVP can be conditionally accepted for controlled local MVP use after the optional second invocation remediation loop.

Scope:
- Review the 4F.42 through 4G.21 evidence chain.
- Record the 4F.43 retry result and 4G.21 review outcome.
- Decide `conditional_go_for_local_mvp` or `no_go_for_mvp`.
- Create this release gate document and the paired ADR.

Non-scope:
- No pilot retry.
- No adapter attempt invocation.
- No production code, contracts, store, Supervisor, CLI, Dashboard, config, approval-state, or runtime worktree changes.
- No approval creation, renewal, revocation, consumption, or mark-used operation.
- No Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, or broader autonomous-use approval.

Acceptance criteria:
- The 4F.43 attempt result and 4G.21 review are recorded.
- The MVP decision is evidence-based and conservative.
- Remaining release blockers are explicit.
- Safety non-approvals are explicit.
- Full verification passes before commit.

Hard boundaries:
- A failed attempt must not be represented as MVP success.
- Conditional local MVP use requires a completed attempt, completed post-run verification, clean workspace mutation check, complete evidence/audit/timeline records, and no release blocker.
- Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, and broader autonomous use remain forbidden.
- Fallback/degraded/local-only output is never authority.

Affected apps/packages:
- `docs/releases`
- `docs/adr`

Risk level: high. This decision gates whether controlled local MVP use can be approved.

## Workflow Skills Used And Why

- `gsd-spec-driver`: used to define the gate objective, scope, non-scope, acceptance criteria, boundaries, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the round ordered as preflight, evidence review, docs, verification, commit, and checkpoint.
- `superpowers-engineering-discipline`: used to keep this round docs-only, evidence-based, and scoped to one release decision.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: used to evaluate the read-only adapter attempt result and process-boundary state.
- `codexhub-workflow-policy-reviewer`: used to review approval, policy, evidence, audit, metadata-only, and forbidden-permission boundaries.
- `codexhub-architecture-planner`: used to confirm no package, app, or boundary architecture changes were made.
- `codexhub-release-auditor`: used for verification, release decision framing, commit evidence, and next-risk summary.

## Skills Not Used And Why

- `codexhub-contract-designer`: not used because no contracts changed.
- Dashboard and Playwright skills: not used because Dashboard UI and browser smoke behavior were not touched.
- Electron/CDP and browser profile skills: not used because Electron/CDP, Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain out of scope.

## Preflight

Starting commit:
- `47ea585 docs: add pilot review after second invocation remediation`

Preflight passed before docs changes:
- `git status --short`: clean
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Chain Reviewed

| Round | Commit / record | Result | Gate impact |
|---|---|---|---|
| 4F.42 | `d14ff8e` | remediated nonzero invocation diagnostics and added Supervisor invocation-contract freshness checks | Enabled one controlled retry |
| 4F.43 | `024419c` | authoritative retry invoked boundary, then failed with `process_exit_nonzero`, `exitCode=1`, and `nonzeroExitKind=codex_cli_input_missing_suspected` | MVP success not demonstrated |
| 4G.21 | `47ea585` | `pilot_review_complete_with_input_governance_release_blocker` | 4H.16 must be No-Go |

## Latest Pilot Evidence

- Latest retry round: 4F.43.
- Attempt id: `codex_real_read_only_adapter_attempt_6f5c3a95-c017-45c4-a899-1cabd1765385`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Approval artifact id: `codex_approval_artifact_a8bbb728-3301-4893-993e-7cb721ecbc7b`
- Prerequisite record id: `codex_real_read_only_adapter_pilot_prerequisite_a0f05ece-5913-4cdd-8547-ed3d983fd42f`
- Source-preparation record id: `codex_real_read_only_adapter_pilot_source_preparation_e29fb9b8-908f-486f-99bc-63c8c4eef7b7`
- Approval authority trace id before retry: `codex_real_read_only_adapter_approval_authority_trace_b9eac541-c475-47de-9e68-26b63af8a1cc`
- Approval authority trace id used by attempt: `codex_real_read_only_adapter_approval_authority_trace_2ae2e299-df30-4266-8da1-6793ed6aef81`
- Attempt status: `failed`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Fallback used as authority: `false`
- Preflight status: `passed`
- Process boundary invoked: `true`
- Result status: `failed`
- Result error code: `boundary_failed`
- Boundary failure code: `process_exit_nonzero`
- Exit code: `1`
- `nonzeroExitKind`: `codex_cli_input_missing_suspected`
- Boundary diagnostics complete: `true`
- Boundary diagnostics missing fields: none reported
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- Evidence refs: `evidence_4045234f-97d3-4f38-93b4-ef1b5ecd1260`, `evidence_3cb623d6-aff4-467b-8320-a6e11d8eded8`
- Audit refs: `audit_f836ee80-0579-4fed-938e-cf6c799c1644`, `audit_b80daf2e-fc88-45d8-8f68-da494ccaa060`

## Release Decision

Outcome: `no_go_for_mvp`.

The read-only adapter MVP is not conditionally accepted for controlled local MVP use in this gate.

Reason: the latest controlled retry reached the approved process boundary, but the attempt did not complete. It failed with `process_exit_nonzero`, `exitCode=1`, and `nonzeroExitKind=codex_cli_input_missing_suspected`; post-run verification was skipped because the attempt did not complete. Round 4G.21 records this as an input-governance release blocker.

This No-Go does not revert the implementation. It means the bounded process-start/invocation remediation train has closed and the remaining issue must be handled as a new input-governance design/remediation route.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Latest retry authority | 4F.43 attempt readback and 4G.21 review | Authoritative, Supervisor-backed, persisted, non-degraded, and not fallback authority | Evidence accepted |
| Latest retry preflight | 4F.43 attempt readback | `preflightStatus=passed` | Governance/readiness gates aligned |
| Boundary invocation | 4F.43 attempt readback | `processBoundaryInvoked=true` | Boundary was exercised |
| Attempt completion | 4F.43 attempt readback | `status=failed`, `resultStatus=failed` | MVP success not demonstrated |
| Nonzero exit | 4F.43 and 4G.21 readback | `process_exit_nonzero`, `exitCode=1` | Release blocker remains |
| Nonzero classification | 4F.43 and 4G.21 readback | `codex_cli_input_missing_suspected` | New input-governance blocker identified |
| Post-run verification | 4F.43 attempt readback | `skipped`, reason `attempt_not_completed` | MVP verification requirement unmet |
| Workspace mutation | 4F.43 attempt readback | `workspaceMutationDetected=false` | Clean, but insufficient without completed attempt |
| Timeline/evidence/audit | 4F.43 and 4G.21 readback | Timeline, evidence refs, and audit refs exist | Operational evidence exists but is insufficient for MVP approval |
| Pilot review | 4G.21 review | `pilot_review_complete_with_input_governance_release_blocker` | Gate must record No-Go |
| Safety boundary | 4G.21 review and audits | No Dashboard trigger, workspace write, danger full access, raw body, raw path, raw executable, argv, or env value persistence found | Boundary held |

## Remaining Blockers

- `process_exit_nonzero`
- `exitCode=1`
- `nonzeroExitKind=codex_cli_input_missing_suspected`
- No completed controlled pilot attempt.
- No completed-attempt post-run verification metadata.
- 4G.21 records an input-governance release blocker.

## Optional Route Decision

The optional invocation/nonzero remediation loop is closed by this gate.

4F.43 no longer shows the original unsupported-argv / `exitCode=2` usage-error blocker. The failure moved to `codex_cli_input_missing_suspected`, which is outside the bounded invocation/process-start remediation scope. A third invocation loop is not allowed.

The next route should be a new input-governance remediation round. That round should decide how the read-only adapter may provide permitted input to the Codex subprocess without persisting raw prompt or command bodies, without putting raw input in argv, and without weakening approval, evidence, audit, or policy gates.

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- `shell=true` remains forbidden.
- Arbitrary executable paths and arbitrary argv remain forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning body, argv, executable path, env values, and raw absolute worktree path persistence remain forbidden.
- Broader autonomous use remains forbidden unless future governance approves it.

## Verification

Final verification before commit:
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: showed only the two new 4H.16 docs before commit

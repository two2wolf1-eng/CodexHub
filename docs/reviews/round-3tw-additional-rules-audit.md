# Round 3T-W.1 Additional Execution Rules Audit

## Executive Summary

Round 3T-W.1 audited the additional execution rules applied to Round 3T-W. The audit found one evidence gap: the default local SQLite store did not contain a persisted Round 3S `conditional_go_to_disabled_skeleton` implementation-plan-review record before Phase A. A local governance decision record was explicitly created through the existing Supervisor 3S API route using in-process request injection. This record is governance-only and does not grant execution permission.

Fixture path guarding was hardened to resolve existing fixture paths through the filesystem real path before allowing replay. This prevents a fixture path inside `packages/codex-kernel/fixtures` from resolving outside that root through a symlink when symlink behavior is detectable on the platform.

## Phase A Preflight Evidence

- Required precondition: a recorded Round 3S implementation-plan-review decision with `outcome=conditional_go_to_disabled_skeleton`.
- Initial audit result: no persisted matching record was found in `.codexhub/data/codexhub.sqlite`.
- Remediation: created an explicit local governance decision record through `POST /api/codex/exec/read-only-adapter/implementation-plan-review` using the existing Supervisor route without opening a network listener.
- Created record id: `codex_read_only_adapter_implementation_plan_review_54879ab2-4a79-44b5-8852-08db6174d1f0`.
- Record outcome: `conditional_go_to_disabled_skeleton`.
- Record status: `recorded`.
- Record scope: disabled skeleton only.

Verified record flags:

- `implementationApproved=false`
- `processAdapterApproved=false`
- `recommendationGrantsExecution=false`
- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `disabledSkeletonApproved=true`

This record does not approve a process adapter, real Codex execution, external process start, workspace writes, or Dashboard-triggered adapter actions.

## 3S Decision Record Status

The local store now contains one explicit 3S implementation-plan-review decision with the required conditional skeleton outcome. The record is local governance evidence only. It is intentionally stored in the ignored SQLite data path and is not committed to source control.

## Fixture Path Guard Coverage

Existing and updated tests cover the Phase C fixture boundary path guard:

- absolute path rejected
- `../` traversal rejected
- non-JSONL path rejected
- path outside fixture root rejected
- missing file returns a safe 404 without leaking the local absolute path
- symlink escape is attempted and rejected when the platform allows symlink creation

The guard now checks both the syntactic requested path and the real filesystem target for existing fixture files.

## Symlink Escape Status

Implementation status: hardened.

Automated test status on this workstation: symlink creation was not available, so the symlink-specific assertion was not exercised here. The test remains in place and will assert rejection when run on a platform that permits creating the test symlink.

Blocking TODO before any real process boundary:

- Before a future real process boundary is considered, symlink escape coverage must be either executed successfully in CI/manual validation or replaced with a stable platform-independent test harness for the fixture path resolver.

## Commit Strategy Assessment

Round 3T-W used a single commit for the combined Phase A/B/C/D work:

- `6a91de0 chore: add disabled read-only adapter readiness workflow`

The original plan allowed a single commit if the change was manageable. Phase checkpoints were recorded in the development thread, and Phase D added durable review/ADR docs. Round 3T-W.1 adds this follow-up audit report so the additional precondition, fixture guard, and checkpoint strategy are captured in repository documentation.

## No-live Boundary Confirmation

Round 3T-W.1 did not add any real adapter path. It did not add or use:

- real `codex exec`
- `child_process`, `spawn`, `exec`, or `node:child_process`
- Codex app-server integration
- Electron/CDP integration
- Chrome Profile or ChatGPT Workspace integration
- browser click/input automation
- workspace writes
- Dashboard trigger or execution button

The 3S record and fixture guard remediation remain control-plane/governance-only.

## Remaining Blockers Before Real Adapter ADR

- Symlink escape test must be exercised or manually verified on a platform where symlink creation is available.
- Any future real read-only adapter still requires a separate ADR/go-no-go review.
- A future implementation must remain CLI-only, read-only, explicitly configured, hash-bound to dry-run and policy decisions, isolated-worktree scoped, and evidence/audit-backed.
- `workspace_write`, `danger_full_access`, Dashboard-triggered execution, and any process adapter approval remain out of scope.

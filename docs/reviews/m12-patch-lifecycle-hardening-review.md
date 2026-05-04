# M12 Patch Lifecycle Hardening Review

## Status

M12.5 reviewed the M12a-M12d controlled patch lifecycle chain and added one schema-level hardening fix for retry/cleanup projections.

## Review Scope

- M12 controlled patch contracts in `packages/contracts`.
- M12 orchestrator helpers in `packages/orchestrator-kernel`.
- Governed Codex patch handoff metadata from `packages/codex-exec-adapter`.
- M12 release docs, integration config, orchestration config, and scaffold health registration.

## Findings And Fixes

- Added schema enforcement that `retry_planned` projections require a previous attempt, a retry reason hash, and `resumeAllowed=true`.
- Added schema enforcement that terminal patch lifecycles cannot expose retry or cleanup handoff state.
- Expanded raw metadata rejection to cover PR body aliases and raw command body aliases.
- Added contract tests for first-attempt retry, missing retry reason hash, terminal retry leakage, and raw PR body metadata.

## Safety Review

- M12c readiness still requires passed verification and changed files before local draft readiness.
- M12d retry/resume/cleanup remains projection-only; real retry needs a new approval.
- Cleanup remains governed, non-force, and has no filesystem delete fallback.
- Push and remote pull request creation remain forbidden.
- No Supervisor route, Dashboard write UI, CLI write command, process boundary, network boundary, Browser/Electron/MCP surface, or GitHub integration was added.

## Residual Risk

- M12b real patch execution remains disabled by default and should stay behind persisted approval, hash-bound worktree input, and isolated worktree write scope.
- M12d cleanup is a handoff projection only; real cleanup execution remains governed by the existing M6c cleanup control plane and should not be force-enabled.
- Future M13 work must keep PR creation and push as separate approval-gated milestones.

## Verification Evidence

The M12.5 release gate requires focused contract/orchestrator tests, focused lint/build for changed projects, scaffold health, boundary audits, no-live automation audit, skills audit, foundation verification, and diff check.

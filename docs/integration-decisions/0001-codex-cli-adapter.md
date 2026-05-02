# Integration Decision 0001: Codex CLI Adapter

## Status

Planned for M2a. This M1.5 round records the integration boundary only.

## Purpose

CodexHub will treat Codex CLI as a capability provider for coding-agent execution. CodexHub remains the authority provider for dry-run, policy, approval, evidence, and audit decisions.

## Provider

- Project: Codex CLI
- Adapter: `codex-exec-adapter` planned, not implemented in M1.5
- Provider type: official CLI
- License: governed by the installed Codex CLI distribution; verify before enabling the adapter
- Version pinning: defer to M2a, where the adapter must record the CLI version in evidence
- Process boundary: may start an external process in M2a only after adapter approval
- Network access: inherited from Codex CLI behavior, governed by sandbox and approval policy
- Local filesystem access: constrained by CodexHub cwd allowlist and Codex sandbox mode
- Sensitive data handling: prompt/body content must be hash-bound or redacted; raw body storage is forbidden

## Policy

- Default risk: medium
- Default action mode: dry-run
- Real execution requires persisted approval when a process boundary can be invoked
- `workspace_write`, `danger_full_access`, arbitrary CLI flags, auto commit, auto push, browser launch, and Electron launch are out of scope for M2a foundation entry
- Capability provider output cannot grant execution authority

## Evidence And Audit

- stdout: hash-only
- stderr: hash-only
- JSONL events: redacted summaries and hashes
- Process boundary: must record `processBoundaryInvoked` and `externalProcessStarted`
- Audit event: must include actor, action, target, reason, policyDecisionId, and evidenceRefs

## Rollback

If M2a validation fails, keep Codex CLI disabled in `.codexhub/integrations.yaml` and continue using the existing Codex read-only control-plane fixtures.

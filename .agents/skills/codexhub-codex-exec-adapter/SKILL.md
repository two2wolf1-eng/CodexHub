---
name: codexhub-codex-exec-adapter
description: Use when modifying codex-kernel or the Codex exec control plane, parser, replay, dry-run, preflight, approval, or gate logic.
---

# CodexHub Codex Exec Adapter

Use this skill before changing Codex control-plane code.

For explicitly approved production real-client automation rounds, also use
`codexhub-production-real-automation-governor`. In those rounds, this skill's no-live rules
remain the foundation default, but Codex CLI Suggest, Auto Edit, and Full Auto may be enabled
only through fixed argv shapes, controlled worktrees, dry-run, approval, store-resolved
authority, bounded evidence, audit, and runtime gates.

Inputs:

- Intent, dry-run plan, command preview, policy decision, approval artifact, preflight result, and gate result.
- No-live boundary for the round.

Process:

- In foundation and no-live rounds, do not start external processes.
- In foundation and no-live rounds, do not import process-launching modules.
- Do not generate arbitrary executable commands.
- Use an args allowlist for future Codex CLI adapters; never pass arbitrary flags through.
- Parse `--json` output through fixtures before any live process boundary is enabled.
- Audit processBoundaryInvoked and externalProcessStarted as authoritative boundary state.
- Store prompt summaries, hashes, and lengths only.
- Keep liveExecution false, externalProcessStarted false, and executionDisabled true unless a later human-approved production real automation round changes the boundary.

Output:

- Control-plane state transition summary.
- Evidence and audit actions.
- Disabled reasons.
- No-live audit result.

---
name: codexhub-codex-exec-adapter
description: Use when modifying codex-kernel or the Codex exec control plane, parser, replay, dry-run, preflight, approval, or gate logic.
---

# CodexHub Codex Exec Adapter

Use this skill before changing Codex control-plane code.

Inputs:

- Intent, dry-run plan, command preview, policy decision, approval artifact, preflight result, and gate result.
- No-live boundary for the round.

Process:

- Do not start external processes.
- Do not import process-launching modules.
- Do not generate full executable commands.
- Store prompt summaries, hashes, and lengths only.
- Keep liveExecution false, externalProcessStarted false, and executionDisabled true unless a later human-approved round changes the boundary.

Output:

- Control-plane state transition summary.
- Evidence and audit actions.
- Disabled reasons.
- No-live audit result.

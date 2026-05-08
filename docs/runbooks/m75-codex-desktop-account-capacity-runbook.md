# M75 Codex Desktop Account-Capacity Runbook

## Purpose

Use this runbook when operating or testing the governed Codex Desktop account-capacity orchestration layer.

## Operator Flow

1. Register authorized accounts and Desktop surfaces server-side through governed configuration or store records.
2. Read Codex Desktop state through `/api/codex-desktop-orchestration/state-reads`.
3. Review capacity summaries and routing decisions before dispatch.
4. Use the current authorized account when capacity is available.
5. Switch only to another registered authorized account when policy, approval, authority, and evidence requirements are satisfied.
6. Dispatch tasks through input references only; never submit or persist raw prompts through public routes.
7. Treat member add/remove as delegated admin maintenance, not as routing or quota recovery.
8. Use Claude Code repair proposals only for adapter/manifest/test repair in controlled worktrees.

## Required Gates

- `CODEXHUB_CODEX_DESKTOP_ORCHESTRATION_ENABLED=true`
- `CODEXHUB_CODEX_DESKTOP_STATE_READER_ENABLED=true` for state reads
- `CODEXHUB_CODEX_DESKTOP_ACCOUNT_SWITCH_ENABLED=true` for account switching
- `CODEXHUB_CODEX_DESKTOP_TASK_DISPATCH_ENABLED=true` for task dispatch
- `CODEXHUB_CHATGPT_WORKSPACE_MEMBER_ORCHESTRATOR_ENABLED=true` for workspace member operations
- `CODEXHUB_CLAUDE_CODE_REPAIR_ENABLED=true` for Claude repair proposal runs

## Stop Conditions

Stop and escalate when the system reports login required, MFA required, permission denied, unauthorized account/workspace, exhausted capacity, identity verification mismatch, drift, missing delegated-admin authority, or quota-evasion intent.

## Forbidden Material

Never collect, print, persist, or export raw endpoint URLs, selectors, JavaScript, prompts, DOM, cookies, sessions, tokens, passwords, MFA fields, browser credentials, profile paths, or raw profile material.

# M46 Runtime External Agent Operator Runbook

## Purpose

Use this runbook when inspecting runtime scheduler metadata or preparing a governed external agent patch run.

## Defaults

- Runtime scheduler is disabled unless `CODEXHUB_RUNTIME_SCHEDULER_ENABLED=true`.
- Child workflow coordination is disabled unless `CODEXHUB_RUNTIME_CHILD_WORKFLOW_COORDINATION_ENABLED=true`.
- External agents are disabled unless `CODEXHUB_EXTERNAL_AGENTS_ENABLED=true`.
- Codex CLI is disabled unless `CODEXHUB_EXTERNAL_AGENT_CODEX_ENABLED=true`.
- Claude Code CLI is disabled unless `CODEXHUB_EXTERNAL_AGENT_CLAUDE_ENABLED=true`.

## Operator Flow

1. Check runtime status in Dashboard `#/runtime` or with `codexhub runtime status`.
2. Confirm a governed sibling worktree record exists for the intended task.
3. Create an external agent dry-run through the Supervisor control plane.
4. Review the dry-run metadata: provider, worktree hash, prompt hash, instruction hash, fixed argv-shape hash, expected patch hash, and blockers.
5. Request and persist approval for that exact dry-run.
6. Start the run only after approval is approved, unused, unexpired, and hash-bound.
7. Review the patch summary hashes, file counts, evidence refs, audit ids, and boundary booleans.

## Stop Conditions

- Missing or disabled runtime/external-agent env gate.
- Missing governed worktree record.
- Any raw prompt, patch, command, path, token, or environment value in a public response.
- Hash mismatch between dry-run, approval, and run request.
- Attempt to run outside a controlled sibling worktree.
- UI, CLI, or MCP direct adapter execution signal.

## Rehearsal

- Runtime: `codexhub runtime rehearse --fixture --scenario resume-from-checkpoint`
- External agent Codex fixture: `codexhub agents external rehearse --fixture --provider codex --scenario codex-all-pass`
- External agent Claude fixture: `codexhub agents external rehearse --fixture --provider claude --scenario claude-all-pass`

These rehearsals do not start external CLIs.

---
name: codexhub-workflow-policy-reviewer
description: Use when modifying workflow, security, approval, evidence, audit, policy, or risk behavior.
---

# CodexHub Workflow Policy Reviewer

Use this skill before changing governance behavior.

Inputs:

- Action type, risk level, approval mode, evidence expectations, and audit actions.
- Dry-run and execution boundaries.

Process:

- Dangerous actions require dry-run first.
- High and critical risk actions require explicit approval.
- Real write action mode requires dry-run, persisted approval, evidence, and audit even when risk is medium.
- Request-body approval artifacts are untrusted; resolve approval authority from the store.
- Evidence must be metadata/hash-only when sensitive content may exist.
- Audit events must state liveExecution and externalProcessStarted.
- MCP tools and capability adapters must declare risk, action mode, evidence policy, and approval policy before execution.
- Browser act and Electron main inspector remain approval-gated and disabled as foundation defaults.
- Browser, Electron, workspace, account, and profile automation remains read-only or disabled unless separately approved.

Output:

- Policy/risk summary.
- Required approvals.
- Evidence/audit coverage.
- Blocked or degraded states.

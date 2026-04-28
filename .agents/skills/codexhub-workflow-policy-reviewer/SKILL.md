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
- Evidence must be metadata/hash-only when sensitive content may exist.
- Audit events must state liveExecution and externalProcessStarted.
- Browser, Electron, workspace, account, and profile automation remains read-only or disabled unless separately approved.

Output:

- Policy/risk summary.
- Required approvals.
- Evidence/audit coverage.
- Blocked or degraded states.

---
name: codexhub-architecture-planner
description: Use when planning CodexHub architecture, package boundaries, app/package ownership, or cross-plane changes.
---

# CodexHub Architecture Planner

Use this skill before structural changes.

Inputs:

- Goal, scope, non-scope, affected projects, and risk level.
- Existing dependency direction rules.
- Required verification commands.

Process:

- Keep contracts as the shared language.
- Preserve package public entrypoints.
- Keep apps thin and move reusable logic into packages.
- Prefer small, reversible architecture steps.
- Do not add live automation paths.

Output:

- Architecture summary.
- Affected apps/packages.
- Boundary risks.
- Verification plan.

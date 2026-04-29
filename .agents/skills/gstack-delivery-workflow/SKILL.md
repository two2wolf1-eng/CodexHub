---
name: gstack-delivery-workflow
description: Use when planning or executing any CodexHub development round to structure delivery as Plan, Build, Review, QA, Ship, and Retro.
---

# GStack Delivery Workflow

Use this skill to keep delivery small, ordered, and auditable.

Inputs:

- GSD Spec.
- Affected files and expected verification commands.

Process:

- Plan the smallest useful sequence of work.
- Build scoped changes only.
- Review diffs for policy, boundary, and regression risk.
- QA with focused checks first, then foundation verification when appropriate.
- Ship only after verification passes.
- Retro with evidence, TODOs, and next recommended round.

Output:

- A GStack Plan section before code changes.
- A closeout summary with verification evidence and commit status.

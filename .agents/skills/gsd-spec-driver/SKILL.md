---
name: gsd-spec-driver
description: Use when starting any CodexHub development round to turn the user request into Goal, Scope, Non-scope, Acceptance criteria, Hard boundaries, Affected apps/packages, and Risk level before editing.
---

# GSD Spec Driver

Start every CodexHub round by writing a bounded spec.

Inputs:

- User request and latest project context.
- Relevant safety, package boundary, and acceptance constraints.

Process:

- State the Goal in user-visible terms.
- List exact Scope and Non-scope.
- Restate Acceptance criteria and Hard boundaries.
- Name affected apps, packages, docs, and tools.
- Classify Risk level as low, medium, high, or critical.

Output:

- A concise GSD Spec section before code changes.
- Clear exclusions for live automation, account operations, and real workspace writes when applicable.

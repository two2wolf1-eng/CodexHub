---
name: codexhub-release-auditor
description: Use when finishing a CodexHub round, reviewing diffs, running verification, preparing commits, or writing release summaries.
---

# CodexHub Release Auditor

Use this skill during closeout for every round.

Inputs:

- Diff summary.
- Verification commands and results.
- Known TODOs and next recommended round.

Process:

- Confirm no scope creep.
- Confirm no-live boundaries still hold.
- Confirm audits and tests passed.
- Confirm integration dependencies, licenses, process boundaries, and rollback notes are documented before enabling adapters.
- Confirm new adapters have contract tests for manifest, dry-run, execution authority, execution result, evidence, and audit.
- Confirm git status before and after commit.
- Summarize evidence without overstating coverage.

Output:

- Changed files summary.
- Verification evidence.
- Commit hash.
- TODOs and next-step recommendation.

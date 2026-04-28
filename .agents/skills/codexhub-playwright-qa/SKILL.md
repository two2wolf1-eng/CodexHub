---
name: codexhub-playwright-qa
description: Use when modifying Dashboard UI, browser smoke checks, QA notes, frontend state handling, or visual verification plans.
---

# CodexHub Playwright QA

Use this skill before changing Dashboard or QA surfaces.

Inputs:

- UI change, expected data state, degraded state, and smoke target.
- Allowed verification method for the round.

Process:

- Verify the Dashboard does not crash when supervisor is unavailable.
- Prefer lightweight smoke checks for foundation work.
- Do not add browser click/input automation unless separately approved.
- Capture evidence as status, route, and response summary.

Output:

- QA scope.
- Smoke result.
- Degraded-state behavior.
- Remaining UI risk.

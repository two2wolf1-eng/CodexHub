---
name: codexhub-browser-profile-observer
description: Use when working on Browser Profile, Chrome Profile, workspace observation, browser profile health, or profile observation models.
---

# CodexHub Browser Profile Observer

Use this skill before touching Browser Profile modules.

Inputs:

- Profile model, health model, observation model, and read-only scope.
- Workspace governance boundaries.

Process:

- Do not open or connect to real browser profiles.
- Do not read cookies, tokens, sessions, accounts, or MFA data.
- Do not perform browser input or click automation.
- Prefer Playwright read-only observation plans that expose title, URL, accessibility snapshots, console summaries, and network metadata only.
- Hash profile paths and forbid network body storage by default.
- Keep workspace observation as interface-only until separately approved.

Output:

- Interface change summary.
- Privacy safeguards.
- Read-only guarantees.
- Tests or audit checks.

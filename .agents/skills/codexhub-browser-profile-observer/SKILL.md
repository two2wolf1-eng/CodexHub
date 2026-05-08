---
name: codexhub-browser-profile-observer
description: Use when working on Browser Profile, Chrome Profile, workspace observation, browser profile health, or profile observation models.
---

# CodexHub Browser Profile Observer

Use this skill before touching Browser Profile modules.

For explicitly approved production real-client automation rounds, also use
`codexhub-production-real-automation-governor`. In those rounds, this skill's read-only rules
remain the foundation default, but reviewed real clicks, typing, submits, uploads, downloads,
profile switching, and workspace switching are allowed only through registered surfaces,
operation manifests, dry-run, approval, store-resolved authority, evidence, and audit.

Inputs:

- Profile model, health model, observation model, and read-only scope.
- Workspace governance boundaries.

Process:

- In foundation and observer rounds, do not open or connect to real browser profiles.
- Do not read cookies, tokens, sessions, accounts, or MFA data.
- In foundation and observer rounds, do not perform browser input or click automation.
- Prefer Playwright read-only observation plans that expose title, URL, accessibility snapshots, console summaries, and network metadata only.
- Hash profile paths and forbid network body storage by default.
- Keep workspace observation as interface-only until separately approved through the production real automation governor.

Output:

- Interface change summary.
- Privacy safeguards.
- Read-only guarantees.
- Tests or audit checks.

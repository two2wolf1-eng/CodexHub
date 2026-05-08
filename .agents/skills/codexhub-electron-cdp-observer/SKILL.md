---
name: codexhub-electron-cdp-observer
description: Use when working on Electron or CDP observation interfaces, target models, endpoint models, or read-only observer placeholders.
---

# CodexHub Electron CDP Observer

Use this skill before touching Electron/CDP modules.

For explicitly approved production real-client automation rounds, also use
`codexhub-production-real-automation-governor`. In those rounds, this skill's read-only rules
remain the foundation default, but reviewed Codex Desktop/Electron operations are allowed only
through loopback endpoints, registered surfaces, named operation manifests, dry-run, approval,
store-resolved authority, evidence, and audit.

Inputs:

- Target model, endpoint model, observation model, and allowed command list.
- Read-only boundary and risk level.

Process:

- Keep this package interface-only unless a later approved production real automation round expands it.
- In foundation and observer rounds, do not connect to Electron.
- In foundation and observer rounds, do not inspect Electron main process.
- Default main-process inspector behavior to critical risk.
- Require loopback-only debug endpoints and explicit userEnabled state before future observation.
- Keep generic Runtime.evaluate, DOM mutation, click/type, and generic CDP command passthrough forbidden by default; approved rounds may use named snippet ids and reviewed manifests only.
- Represent command allowlists as placeholders until reviewed.

Output:

- Interface change summary.
- Read-only guarantees.
- Risk classification.
- Tests or audit checks.

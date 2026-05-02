---
name: codexhub-electron-cdp-observer
description: Use when working on Electron or CDP observation interfaces, target models, endpoint models, or read-only observer placeholders.
---

# CodexHub Electron CDP Observer

Use this skill before touching Electron/CDP modules.

Inputs:

- Target model, endpoint model, observation model, and allowed command list.
- Read-only boundary and risk level.

Process:

- Keep this package interface-only unless a later approved round expands it.
- Do not connect to Electron.
- Do not inspect Electron main process.
- Default main-process inspector behavior to critical risk.
- Require loopback-only debug endpoints and explicit userEnabled state before future observation.
- Keep Runtime.evaluate, DOM mutation, click/type, and generic CDP command passthrough forbidden by default.
- Represent command allowlists as placeholders until reviewed.

Output:

- Interface change summary.
- Read-only guarantees.
- Risk classification.
- Tests or audit checks.

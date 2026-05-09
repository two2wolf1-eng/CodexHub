---
name: codexhub-production-real-automation-governor
description: Use when implementing explicitly approved production real-client automation, including Browser/Chrome CDP, Electron/CDP, Codex Web, Codex Desktop, Codex CLI, cross-profile, cross-workspace, delegated admin, or break-glass write surfaces.
---

# CodexHub Production Real Automation Governor

Use this skill only for rounds where the user explicitly approves production real-client automation.

This skill is the approved exception path for Browser/Electron/Codex exec surfaces that are read-only by default. It does not weaken credential, login, MFA, quota, permission, workspace, evidence, or audit rules.

Inputs:

- Surface registry entry, operation manifest, capability class, dry-run plan, approval binding, authority ref, evidence policy, audit ledger entry, and runtime gate.
- Target client kind: Chrome/ChatGPT, Codex Web/Cloud, Codex Desktop/Electron, Codex CLI, or controlled local repo workflow.

Process:

- Treat real clicks, typing, submits, uploads, downloads, process starts, and repo-changing tasks as production actions.
- Require every production action to resolve through registered surfaces and reviewed operation manifests.
- Reject caller-supplied raw CDP endpoints, selectors, JavaScript, authority material, prompt bodies, file bodies, profile paths, tokens, cookies, sessions, passwords, MFA fields, raw DOM, and raw network bodies.
- Keep forbidden capabilities impossible: cookie/session/token reads, credential extraction, login or MFA bypass, permission bypass, impersonation, session replay, and unowned-session operation.
- Standard and restricted production actions may execute only from registered manifests.
- High-risk production actions require dry-run, persisted approval, store-resolved authority, evidence, and audit.
- Break-glass production actions require two distinct approver hashes, incident id, TTL, append-only audit, and post-run review.
- Cross-profile, cross-workspace, and delegated-admin automation require explicit delegated authority.
- Real calibration rounds such as M76 may touch live Chrome/ChatGPT or Codex Desktop surfaces only inside TTL-bound calibration sessions with registered calibration targets, calibration authority, before/after verification, retention policy, evidence, and audit.
- Calibration member remove/add rehearsals must use a server-registered `calibrationSafe` target with restore allowed, must block owner/admin/last-admin/unknown targets, and must stop with manual recovery if restore verification fails.
- Use fixed adapter boundaries only; do not add generic CDP command passthrough, arbitrary selector runners, arbitrary JavaScript runners, generic shell, arbitrary argv, or operate-any-page behavior.
- Product defaults remain disabled until env gates, canaries, drift checks, and approval gates all pass.

Output:

- Capability class and risk summary.
- Surface and operation manifest summary.
- Approval/authority requirements.
- Evidence and audit coverage.
- Explicit list of still-forbidden capabilities.
- Tests or audits proving no generic passthrough and no secret material persistence.

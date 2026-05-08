# M75 Codex Desktop Account-Capacity Orchestration

## Summary

M75 adds the governed Codex Desktop account/session/task orchestration layer on top of the M74 production real-client registry. It is designed for legitimate capacity-aware routing across already-authorized Codex Desktop accounts and workspaces.

## Delivered

- Added metadata-only contracts for authorized account records, observed Desktop state, capacity state, routing decisions, account-switch evidence, task-dispatch evidence, workspace member state/actions, Claude Code repair proposals, and M75 rehearsals.
- Added `codex-desktop-orchestration-kernel` for registry projections, bounded state summaries, quota-aware routing, account switch planning, task dispatch evidence, workspace member guardrails, and repair proposal records.
- Added SQLite metadata repositories for all M75 records.
- Added `/api/codex-desktop-orchestration/*` Supervisor routes with local-control/origin gates inherited from Supervisor and M75-specific raw material rejection.
- Added Dashboard `#/codex-desktop` as an ops-focused metadata view.

## Boundaries

- Capacity-aware routing is allowed only for registered authorized accounts with legitimate available capacity.
- Quota evasion is forbidden: routing cannot use account creation, member mutation, account removal, or workspace churn to bypass seat, quota, login, MFA, organization, or workspace limits.
- Production defaults remain disabled. Real switching and dispatch require runtime flags, registered M74 surfaces/manifests, dry-run, approval, authority, evidence, and audit.
- No record stores raw endpoint URLs, selectors, JavaScript, prompts, DOM, cookies, sessions, tokens, passwords, MFA fields, browser credentials, or raw profile material.

## Verification

Focused verification for this round covers contracts through the kernel tests, SQLite metadata round trips, Supervisor route gating, Dashboard route registration, scaffold health, audits, foundation verification, and whitespace checks.

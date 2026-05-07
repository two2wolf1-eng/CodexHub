# M48 Production GA Threat Model

## Assets

- CodexHub SQLite store metadata, including approvals, evidence references, audit ids, and run summaries.
- Local-control token and trusted loopback Origin gate.
- Operator identity hashes and approval artifact ids.
- Child control-plane records for workflows, GitHub, release, deployment, secrets, policy/telemetry, controlled writes, runtime, external agents, and platform operations.
- Backup, restore, migration, retention, and audit export metadata.

## Trust Boundaries

- Dashboard, CLI, and MCP are untrusted entry surfaces unless explicitly routed through reviewed control planes.
- Supervisor POST routes are trusted only after local-control token and trusted loopback Origin checks pass.
- Store-resolved records are trusted as metadata inputs; request-body authority, approval artifacts, child artifacts, and raw payloads are not trusted.
- Capability adapters can observe or execute only after CodexHub governance grants authority.
- External policy backends are advisory. They cannot grant or revoke CodexHub authority.
- Telemetry is observability only. It cannot replace Evidence or Audit.

## Live Boundaries

- GitHub HTTP boundary for metadata, branch, PR lifecycle, PR management, merge, Actions, tag, and release draft operations.
- Deployment provider read/write boundary for observe, apply, sync, and rollback operations.
- Browser action boundary for allowlisted click/type only.
- Electron main inspector boundary for allowlisted named snippet execution only.
- MCP direct write boundary for controlled sibling worktree patch only.
- External agent process boundary for fixed Codex CLI and Claude Code CLI argv shapes only.
- Platform operations boundary for local backup, restore rehearsal/replacement, migration, retention, audit export, and role metadata.

## Authority Model

CodexHub `security-kernel` remains the final authority. GA signoff does not grant child authority. Child control planes keep their own dry-run, approval, evidence, audit, and boundary checks.

## Approval Model

- GA signoff is critical risk and requires two approved GA artifacts with distinct approver hashes.
- Production deploy, restore replace, merge, controlled writes, and external agent runs keep their own existing approval rules.
- Request-body `approvalArtifact`, `executionAuthority`, `authority`, and child artifacts are always rejected.

## Evidence And Audit Model

Public output is metadata-only: ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans. Raw prompt, stdout, stderr, diff, path, URL, body, token, cookie, session, env, PR body, release body, deploy payload, log, trace, patch, DB row, and audit body are forbidden.

## Rollback And Disaster Recovery

- Deployment rollback requires a persisted rollback plan.
- Platform restore replacement is disabled by default and requires scheduler quiescence, manifest hash match, and two approvals.
- Backup and audit export are local metadata-only operations in the current baseline.

## Residual Risks

- Conditional live smoke may be readiness-blocked when local or remote runtime prerequisites are absent.
- Operator training evidence must be complete or explicitly blocked for non-critical reasons before GA signoff.
- Future capability additions must update this threat model before becoming signoff eligible.

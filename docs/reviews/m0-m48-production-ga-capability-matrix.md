# M0-M48 Production GA Capability Matrix

## Matrix

| Surface | State | Risk | Approval | Evidence/Audit | Rollback |
| --- | --- | --- | --- | --- | --- |
| Local patch, review package, RC | Governed | High | Child-specific approval | Required | Worktree cleanup handoff |
| Custom workflow catalog and recovery | Governed | Critical | Workflow plus child approvals | Required | Recovery metadata and handoff |
| GitHub metadata, branch, draft PR, PR lifecycle | Governed | High/Critical | Per route family | Required | Supersede/cleanup control planes |
| GitHub PR labels, assignees, reviewers, milestones, comments | Governed | High | Per action family | Required | Add/set only in v1 |
| GitHub merge | Governed | Critical | Two approvals | Required | No automatic unmerge |
| GitHub Actions observe/rerun/cancel/dispatch | Governed | High/Critical | Per action family | Required | Metadata handoff |
| Release version, tag, draft release | Governed | High/Critical | Tag/draft approvals | Required | No publish in v1 |
| Deployment observe/apply/sync/rollback | Governed | Critical | Environment-specific; prod two approvals | Required | Persisted rollback plan |
| Secrets/environment governance | Readiness-only | High | Readiness approval | Required | No secret value read |
| Real policy backend | Advisory | High | Evaluation approval | Required | Cannot grant authority |
| Real telemetry | Observability | Medium/High | Export approval | Required | Cannot replace Evidence/Audit |
| Browser controlled write | Governed | High/Critical | Action approval | Required | Metadata handoff |
| Electron main inspector | Governed | Critical | Snippet approval | Required | Metadata handoff |
| MCP controlled worktree patch | Governed | Critical | Tool approval | Required | Controlled sibling worktree only |
| Runtime scheduler and queue | Governed | Critical | Job/control-plane approval as applicable | Required | Cancel/retry/checkpoint metadata |
| External Codex/Claude agents | Governed | Critical | Per run approval | Required | Controlled sibling worktree patch only |
| Platform backup/restore/migration/retention/audit export/operator roles | Governed | Critical | Per operation; restore replace two approvals | Required | DR runbook |
| Production GA signoff | Governed aggregation | Critical | Two GA approvals | Required | Blocks on critical risk |

## GA Rules

- GA signoff aggregates existing child records by id/hash only.
- GA approval cannot replace child approval.
- No live boundary allowlist expands in M48.
- Conditional live smoke may report `readiness_blocked` only for environment-only blockers.
- No unresolved critical residual risk is signoff eligible.

## Final GA Closeout

M48 final release keeps this matrix as the production capability baseline. Any new provider, route family, store repository, live boundary, or authority model change must update this matrix before it can be included in a future GA signoff.

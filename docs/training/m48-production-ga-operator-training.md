# M48 Production GA Operator Training

## 1. Governance Basics

CodexHub automates DevOps through dry-run, approval, evidence, and audit records. Operators should treat every adapter as a capability provider, not an authority provider.

## 2. Approvals And Authority

Approval must be store-resolved and hash-bound. Request-body authority, approval artifacts, and child artifacts are untrusted. GA signoff requires two distinct approver hashes and never replaces child approvals.

## 3. Evidence And Audit Review

Evidence refs and audit ids are the durable review path. Telemetry can help observe behavior, but it cannot replace Evidence or Audit.

## 4. GitHub Lifecycle

GitHub actions are split into fixed control planes: metadata, branch publish, draft PR, PR lifecycle, PR management, merge, Actions, tag, and release draft. Merge is critical and requires separate controls.

## 5. Release, Deploy, And Rollback

Release publish remains outside the current GA baseline. Deployment writes require environment-specific approvals, and rollback requires a persisted rollback plan.

## 6. Secrets Handling

Secrets governance reports configured, missing, and hash summaries only. Secret values must never be read, stored, displayed, or copied into evidence.

## 7. Runtime And External Agent Safety

Runtime scheduling and external agents are governed. Codex CLI and Claude Code can only produce hash-bound patch summaries in controlled sibling worktrees.

## 8. Incident And Disaster Recovery

Operators must know backup, restore rehearsal, store migration, retention, audit export, operator role, and disaster recovery runbooks before GA signoff.

## Completion Evidence

Training completion records only operator hash, module hashes, completion counts, status, evidence refs, and audit ids.

# M68 Business Member Reconciliation Runbook

## Operator Flow

1. Create or refresh an owner admin extraction through `/api/business-quota/owner-admin-extractions`.
2. Create a reconciliation through `/api/business-quota/reconciliations`.
3. Inspect `/api/business-quota/reconciliations` for profile readiness, blockers, and workspace switch dry-runs.
4. Inspect `/api/business-quota/workspace-switches` only as dry-run metadata. Do not treat it as proof of a completed switch.

## Safety Rules

- Do not paste raw account names, raw workspace names, profile paths, tokens, cookies, sessions, MFA codes, passwords, or browser storage.
- Treat workspace switch records as approval-gated dry-runs until a later executor stage enables live visible-click flow.
- Block Codex dispatch when any reconciliation report has `dispatchAllowed=false`.

## Blockers

- Owner roster missing or empty.
- Profile is logged out, personal workspace, not a Business member, workspace mismatched, or unknown.
- Workspace switch approval is required.
- Raw account/workspace/profile material appears in request or projection.

# M69 Codex Quota Fusion Runbook

## Operator Flow

1. Refresh owner admin extraction with `/api/business-quota/owner-admin-extractions`.
2. Refresh Business member reconciliation with `/api/business-quota/reconciliations`.
3. Record quota source and quota snapshot metadata with `/api/business-quota/quota-read-dry-runs`, or create a fusion fixture with `/api/business-quota/quota-fusions`.
4. Inspect `/api/business-quota/quota-fusion` for workspace readiness, account readiness, blockers, evidence, and audit refs.
5. Treat `dispatchAllowed=false` as a hard stop for real Codex dispatch.

## Safety Rules

- Do not paste raw account names, raw workspace names, profile paths, tokens, cookies, sessions, MFA codes, passwords, browser storage, raw quota payloads, or response bodies.
- Do not treat quota fusion as an authority provider. It is a dispatch readiness gate only.
- Do not proceed with real Codex dispatch while source conflict, canary failure, workspace mismatch, missing seat, quota limited, or quota exhausted blockers are present.

## Blockers

- Owner roster or billing summary missing.
- No Codex seat available.
- Profile workspace does not match the Business workspace.
- Quota source health is not healthy.
- Canary has failed.
- Quota snapshot is missing, limited, exhausted, blocked, or unknown.
